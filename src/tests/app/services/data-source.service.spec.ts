import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataSourceService, DataSource, DataSourceType } from '../../../app/services/data-source.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let httpMock: HttpTestingController;

  const mockDataSource: DataSource = {
    id: 'ds-1',
    name: 'Test PostgreSQL',
    type: 'postgresql',
    status: 'connected',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'testdb'
    },
    credentials: {
      username: 'test',
      password: 'test'
    },
    metadata: {
      createdAt: new Date()
    },
    tenantId: 'tenant-1',
    organizationId: 'org-1'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataSourceService]
    });
    service = TestBed.inject(DataSourceService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllDataSources', () => {
    it('should return all data sources', () => {
      const sources = service.getAllDataSources();
      expect(Array.isArray(sources)).toBe(true);
    });
  });

  describe('createDataSource', () => {
    it('should create new data source', () => {
      const newSource = service.createDataSource({
        name: 'Test DB',
        type: 'postgresql',
        config: { host: 'localhost' },
        credentials: { username: 'user' },
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });

      expect(newSource.id).toContain('ds-');
      expect(newSource.name).toBe('Test DB');
      expect(newSource.status).toBe('disconnected');
      expect(newSource.metadata.createdAt).toBeDefined();
    });

    it('should add data source to list', () => {
      const beforeCount = service.getAllDataSources().length;

      service.createDataSource({
        name: 'Test DB',
        type: 'mysql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });

      const afterCount = service.getAllDataSources().length;
      expect(afterCount).toBe(beforeCount + 1);
    });
  });

  describe('getDataSourcesByType', () => {
    beforeEach(() => {
      service.createDataSource({
        name: 'PG 1',
        type: 'postgresql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });
      service.createDataSource({
        name: 'MySQL 1',
        type: 'mysql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });
      service.createDataSource({
        name: 'PG 2',
        type: 'postgresql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });
    });

    it('should return data sources of specific type', () => {
      const pgSources = service.getDataSourcesByType('postgresql');
      expect(pgSources.length).toBe(2);
      expect(pgSources.every(s => s.type === 'postgresql')).toBe(true);
    });
  });

  describe('getDataSource', () => {
    it('should return data source by ID', () => {
      const created = service.createDataSource({
        name: 'Test',
        type: 'mongodb',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });

      const found = service.getDataSource(created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return undefined for invalid ID', () => {
      const found = service.getDataSource('invalid-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getConnectedDataSources', () => {
    it('should return only connected sources', () => {
      const ds1 = service.createDataSource({
        name: 'DS1',
        type: 'postgresql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });

      service.updateDataSource(ds1.id, { status: 'connected' });

      const connected = service.getConnectedDataSources();
      expect(connected.length).toBeGreaterThan(0);
      expect(connected.every(s => s.status === 'connected')).toBe(true);
    });
  });

  describe('updateDataSource', () => {
    it('should update data source properties', () => {
      const created = service.createDataSource({
        name: 'Test',
        type: 'mysql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });

      service.updateDataSource(created.id, { name: 'Updated Name' });

      const updated = service.getDataSource(created.id);
      expect(updated?.name).toBe('Updated Name');
    });
  });

  describe('deleteDataSource', () => {
    it('should delete data source', () => {
      const created = service.createDataSource({
        name: 'Test',
        type: 'postgresql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });

      const success = service.deleteDataSource(created.id);

      expect(success).toBe(true);
      expect(service.getDataSource(created.id)).toBeUndefined();
    });

    it('should return false for invalid ID', () => {
      const success = service.deleteDataSource('invalid-id');
      expect(success).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should test connection and return result', (done) => {
      const testResult = {
        success: true,
        message: 'Connected',
        responseTime: 45
      };

      service.testConnection(mockDataSource).subscribe(result => {
        expect(result).toEqual(testResult);
        done();
      });

      const req = httpMock.expectOne('http://localhost:3007/api/datasources/test');
      expect(req.request.method).toBe('POST');
      req.flush(testResult);
    });

    it('should update status to connected on success', (done) => {
      const created = service.createDataSource({
        name: 'Test',
        type: 'postgresql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });

      service.testConnection(created).subscribe(() => {
        const updated = service.getDataSource(created.id);
        expect(updated?.status).toBe('connected');
        done();
      });

      const req = httpMock.expectOne('http://localhost:3007/api/datasources/test');
      req.flush({ success: true, message: 'OK' });
    });

    it('should update status to error on failure', (done) => {
      const created = service.createDataSource({
        name: 'Test',
        type: 'mysql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });

      service.testConnection(created).subscribe(() => {
        const updated = service.getDataSource(created.id);
        expect(updated?.status).toBe('error');
        done();
      });

      const req = httpMock.expectOne('http://localhost:3007/api/datasources/test');
      req.flush({ success: false, message: 'Failed' });
    });
  });

  describe('getTemplates', () => {
    it('should return all templates', () => {
      const templates = service.getTemplates();
      expect(templates.length).toBe(13);
    });

    it('should include all data source types', () => {
      const templates = service.getTemplates();
      const types = templates.map(t => t.type);
      
      expect(types).toContain('postgresql');
      expect(types).toContain('mysql');
      expect(types).toContain('mongodb');
      expect(types).toContain('snowflake');
      expect(types).toContain('bigquery');
      expect(types).toContain('rest-api');
      expect(types).toContain('graphql');
      expect(types).toContain('aws-cloudwatch');
      expect(types).toContain('azure-monitor');
      expect(types).toContain('gcp-monitoring');
      expect(types).toContain('salesforce');
      expect(types).toContain('hubspot');
      expect(types).toContain('google-analytics');
    });
  });

  describe('getStatistics', () => {
    beforeEach(() => {
      service.createDataSource({
        name: 'PG 1',
        type: 'postgresql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });
      service.createDataSource({
        name: 'MySQL 1',
        type: 'mysql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });
      const ds3 = service.createDataSource({
        name: 'PG 2',
        type: 'postgresql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      });
      service.updateDataSource(ds3.id, { status: 'connected' });
    });

    it('should return correct statistics', () => {
      const stats = service.getStatistics();

      expect(stats.total).toBe(3);
      expect(stats.connected).toBe(1);
      expect(stats.byType['postgresql']).toBe(2);
      expect(stats.byType['mysql']).toBe(1);
    });
  });
});

