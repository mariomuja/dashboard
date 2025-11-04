import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { KpiConfigService, KPIConfig } from '../../../../app/services/kpi-config.service';
import { DataSourceService } from '../../../../app/services/data-source.service';

describe('KpiConfigService', () => {
  let service: KpiConfigService;
  let dataSourceService: jasmine.SpyObj<DataSourceService>;

  beforeEach(() => {
    const dataSourceSpy = jasmine.createSpyObj('DataSourceService', [
      'getDataSource',
      'getAllDataSources'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        KpiConfigService,
        { provide: DataSourceService, useValue: dataSourceSpy }
      ]
    });

    service = TestBed.inject(KpiConfigService);
    dataSourceService = TestBed.inject(DataSourceService) as jasmine.SpyObj<DataSourceService>;
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Configuration Management', () => {
    it('should create a new KPI config', () => {
      const config = {
        name: 'Test KPI',
        description: 'Test Description',
        icon: '📊',
        dataSource: {
          type: 'static' as const,
          staticValue: 100
        },
        formatting: {
          decimals: 0,
          format: 'number' as const
        },
        trend: {
          enabled: true,
          comparisonPeriod: 'previous' as const,
          showPercentage: true
        },
        target: {
          enabled: false
        },
        order: 0,
        visible: true
      };

      const created = service.createConfig(config);

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Test KPI');
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
    });

    it('should get all configs', () => {
      service.createConfig({
        name: 'KPI 1',
        dataSource: { type: 'static', staticValue: 100 },
        formatting: { decimals: 0, format: 'number' },
        trend: { enabled: false },
        target: { enabled: false },
        order: 0,
        visible: true
      });

      const configs = service.getConfigs();
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should get visible configs only', () => {
      service.createConfig({
        name: 'Visible KPI',
        dataSource: { type: 'static', staticValue: 100 },
        formatting: { decimals: 0, format: 'number' },
        trend: { enabled: false },
        target: { enabled: false },
        order: 0,
        visible: true
      });

      service.createConfig({
        name: 'Hidden KPI',
        dataSource: { type: 'static', staticValue: 200 },
        formatting: { decimals: 0, format: 'number' },
        trend: { enabled: false },
        target: { enabled: false },
        order: 1,
        visible: false
      });

      const visible = service.getVisibleConfigs();
      expect(visible.length).toBe(1);
      expect(visible[0].name).toBe('Visible KPI');
    });

    it('should update a config', () => {
      const created = service.createConfig({
        name: 'Original Name',
        dataSource: { type: 'static', staticValue: 100 },
        formatting: { decimals: 0, format: 'number' },
        trend: { enabled: false },
        target: { enabled: false },
        order: 0,
        visible: true
      });

      const updated = service.updateConfig(created.id, { name: 'Updated Name' });
      expect(updated).toBe(true);

      const config = service.getConfigById(created.id);
      expect(config?.name).toBe('Updated Name');
    });

    it('should delete a config', () => {
      const created = service.createConfig({
        name: 'To Delete',
        dataSource: { type: 'static', staticValue: 100 },
        formatting: { decimals: 0, format: 'number' },
        trend: { enabled: false },
        target: { enabled: false },
        order: 0,
        visible: true
      });

      service.deleteConfig(created.id);
      const config = service.getConfigById(created.id);
      expect(config).toBeUndefined();
    });
  });

  describe('KPI Value Fetching', () => {
    it('should fetch static value', async () => {
      const config: KPIConfig = {
        id: 'test-1',
        name: 'Static KPI',
        dataSource: {
          type: 'static',
          staticValue: 500
        },
        formatting: { decimals: 0, format: 'number' },
        trend: { enabled: false },
        target: { enabled: false },
        order: 0,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await service.fetchKpiValue(config);
      expect(result.value).toBe(500);
    });

    it('should return zero for datasource without sourceId', async () => {
      const config: KPIConfig = {
        id: 'test-2',
        name: 'No Source KPI',
        dataSource: {
          type: 'datasource'
        },
        formatting: { decimals: 0, format: 'number' },
        trend: { enabled: false },
        target: { enabled: false },
        order: 0,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await service.fetchKpiValue(config);
      expect(result.value).toBe(0);
    });
  });

  describe('Value Formatting', () => {
    it('should format number without decimals', () => {
      const formatted = service.formatValue(1234.567, { decimals: 0, format: 'number' });
      expect(formatted).toBe('1,235');
    });

    it('should format with prefix', () => {
      const formatted = service.formatValue(1000, { prefix: '$', decimals: 0, format: 'currency' });
      expect(formatted).toBe('$1,000');
    });

    it('should format with suffix', () => {
      const formatted = service.formatValue(3.5, { suffix: '%', decimals: 1, format: 'percentage' });
      expect(formatted).toBe('3.5%');
    });

    it('should format with both prefix and suffix', () => {
      const formatted = service.formatValue(1234.56, { prefix: '$', suffix: ' USD', decimals: 2, format: 'currency' });
      expect(formatted).toBe('$1,234.56 USD');
    });
  });

  describe('Initialization', () => {
    it('should initialize default KPIs if none exist', () => {
      service.initializeDefaultKpis();
      const configs = service.getConfigs();
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should not reinitialize if KPIs already exist', () => {
      service.createConfig({
        name: 'Existing KPI',
        dataSource: { type: 'static', staticValue: 100 },
        formatting: { decimals: 0, format: 'number' },
        trend: { enabled: false },
        target: { enabled: false },
        order: 0,
        visible: true
      });

      const countBefore = service.getConfigs().length;
      service.initializeDefaultKpis();
      const countAfter = service.getConfigs().length;

      expect(countAfter).toBe(countBefore);
    });
  });
});

