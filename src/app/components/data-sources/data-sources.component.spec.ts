import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DataSourcesComponent } from './data-sources.component';
import { DataSourceService, DataSource, DataSourceTemplate } from '../../services/data-source.service';
import { of, throwError } from 'rxjs';

describe('DataSourcesComponent', () => {
  let component: DataSourcesComponent;
  let fixture: ComponentFixture<DataSourcesComponent>;
  let dataSourceService: jasmine.SpyObj<DataSourceService>;

  const mockDataSource: DataSource = {
    id: 'ds-1',
    name: 'Test PostgreSQL',
    type: 'postgresql',
    status: 'connected',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      schema: 'public'
    },
    credentials: {
      username: 'test',
      password: 'test'
    },
    metadata: {
      createdAt: new Date(),
      lastConnected: new Date(),
      recordCount: 100
    },
    tenantId: 'tenant-1',
    organizationId: 'org-1'
  };

  const mockTemplate: DataSourceTemplate = {
    type: 'postgresql',
    name: 'PostgreSQL Database',
    icon: '🐘',
    description: 'Connect to PostgreSQL database',
    defaultConfig: {
      host: 'localhost',
      port: 5432,
      database: 'mydb'
    }
  };

  beforeEach(async () => {
    const dataSourceSpy = jasmine.createSpyObj('DataSourceService', [
      'getAllDataSources',
      'getTemplates',
      'getStatistics',
      'createDataSource',
      'updateDataSource',
      'deleteDataSource',
      'testConnection',
      'syncDataSource',
      'fetchData'
    ]);

    await TestBed.configureTestingModule({
      declarations: [ DataSourcesComponent ],
      imports: [ 
        RouterTestingModule, 
        FormsModule,
        HttpClientTestingModule 
      ],
      providers: [
        { provide: DataSourceService, useValue: dataSourceSpy }
      ]
    }).compileComponents();

    dataSourceService = TestBed.inject(DataSourceService) as jasmine.SpyObj<DataSourceService>;
    
    // Default spy returns
    dataSourceService.getAllDataSources.and.returnValue([]);
    dataSourceService.getTemplates.and.returnValue([mockTemplate]);
    dataSourceService.getStatistics.and.returnValue({
      total: 0,
      connected: 0,
      byType: {}
    });

    fixture = TestBed.createComponent(DataSourcesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load data sources, templates, and statistics', () => {
      component.ngOnInit();

      expect(dataSourceService.getAllDataSources).toHaveBeenCalled();
      expect(dataSourceService.getTemplates).toHaveBeenCalled();
      expect(dataSourceService.getStatistics).toHaveBeenCalled();
    });
  });

  describe('filteredDataSources', () => {
    beforeEach(() => {
      component.dataSources = [
        { ...mockDataSource, id: 'ds-1', type: 'postgresql', status: 'connected' },
        { ...mockDataSource, id: 'ds-2', type: 'mysql', status: 'disconnected' },
        { ...mockDataSource, id: 'ds-3', name: 'Special Source', type: 'mongodb', status: 'connected' }
      ];
    });

    it('should return all data sources when no filter', () => {
      const filtered = component.filteredDataSources;
      expect(filtered.length).toBe(3);
    });

    it('should filter by type', () => {
      component.filterType = 'postgresql';
      const filtered = component.filteredDataSources;
      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe('postgresql');
    });

    it('should filter by connected only', () => {
      component.showConnectedOnly = true;
      const filtered = component.filteredDataSources;
      expect(filtered.length).toBe(2);
      expect(filtered.every(ds => ds.status === 'connected')).toBe(true);
    });

    it('should filter by search query', () => {
      component.searchQuery = 'special';
      const filtered = component.filteredDataSources;
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Special Source');
    });

    it('should combine multiple filters', () => {
      component.filterType = 'mongodb';
      component.showConnectedOnly = true;
      component.searchQuery = 'special';
      const filtered = component.filteredDataSources;
      expect(filtered.length).toBe(1);
    });
  });

  describe('uniqueTypes', () => {
    it('should return unique sorted types', () => {
      component.dataSources = [
        { ...mockDataSource, type: 'postgresql' },
        { ...mockDataSource, type: 'mysql' },
        { ...mockDataSource, type: 'postgresql' },
        { ...mockDataSource, type: 'mongodb' }
      ];

      const types = component.uniqueTypes;
      expect(types).toEqual(['mongodb', 'mysql', 'postgresql']);
    });
  });

  describe('selectTemplate', () => {
    it('should select template and prepare new data source', () => {
      component.selectTemplate(mockTemplate);

      expect(component.selectedTemplate).toBe(mockTemplate);
      expect(component.newDataSource.type).toBe('postgresql');
      expect(component.newDataSource.config?.host).toBe('localhost');
      expect(component.showCreateForm).toBe(true);
    });
  });

  describe('createDataSource', () => {
    it('should create data source', () => {
      spyOn(window, 'alert');
      component.newDataSource = {
        name: 'Test DB',
        type: 'postgresql',
        config: {},
        credentials: {},
        tenantId: 'tenant-1',
        organizationId: 'org-1'
      };
      dataSourceService.createDataSource.and.returnValue(mockDataSource);
      dataSourceService.getAllDataSources.and.returnValue([mockDataSource]);
      dataSourceService.getStatistics.and.returnValue({
        total: 1,
        connected: 0,
        byType: { postgresql: 1 }
      });

      component.createDataSource();

      expect(dataSourceService.createDataSource).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('created successfully'));
    });

    it('should not create if name is missing', () => {
      spyOn(window, 'alert');
      component.newDataSource = {
        name: '',
        type: 'postgresql',
        config: {},
        credentials: {}
      };

      component.createDataSource();

      expect(dataSourceService.createDataSource).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('required'));
    });
  });

  describe('updateDataSource', () => {
    it('should update data source', () => {
      spyOn(window, 'alert');
      component.editingDataSource = { ...mockDataSource };
      dataSourceService.getAllDataSources.and.returnValue([mockDataSource]);
      dataSourceService.getStatistics.and.returnValue({
        total: 1,
        connected: 1,
        byType: { postgresql: 1 }
      });

      component.updateDataSource();

      expect(dataSourceService.updateDataSource).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('updated successfully'));
      expect(component.editingDataSource).toBeNull();
    });

    it('should not update if no data source is being edited', () => {
      component.editingDataSource = null;

      component.updateDataSource();

      expect(dataSourceService.updateDataSource).not.toHaveBeenCalled();
    });
  });

  describe('deleteDataSource', () => {
    it('should delete data source if confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      dataSourceService.deleteDataSource.and.returnValue(true);
      dataSourceService.getAllDataSources.and.returnValue([]);
      dataSourceService.getStatistics.and.returnValue({
        total: 0,
        connected: 0,
        byType: {}
      });

      component.deleteDataSource(mockDataSource);

      expect(window.confirm).toHaveBeenCalled();
      expect(dataSourceService.deleteDataSource).toHaveBeenCalledWith(mockDataSource.id);
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('deleted successfully'));
    });

    it('should not delete if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteDataSource(mockDataSource);

      expect(dataSourceService.deleteDataSource).not.toHaveBeenCalled();
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', (done) => {
      const testResult = {
        success: true,
        message: 'Connected!',
        responseTime: 45,
        recordCount: 100
      };
      dataSourceService.testConnection.and.returnValue(of(testResult));
      dataSourceService.getAllDataSources.and.returnValue([mockDataSource]);

      component.testConnection(mockDataSource);
      
      setTimeout(() => {
        expect(component.testResult).toEqual(testResult);
        expect(component.testingDataSource).toBeNull();
        done();
      }, 100);
    });

    it('should handle connection test failure', (done) => {
      const testResult = {
        success: false,
        message: 'Connection failed'
      };
      dataSourceService.testConnection.and.returnValue(of(testResult));

      component.testConnection(mockDataSource);

      setTimeout(() => {
        expect(component.testResult).toEqual(testResult);
        expect(component.testingDataSource).toBeNull();
        done();
      }, 100);
    });

    it('should handle connection test error', (done) => {
      dataSourceService.testConnection.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      component.testConnection(mockDataSource);

      setTimeout(() => {
        expect(component.testResult?.success).toBe(false);
        expect(component.testingDataSource).toBeNull();
        done();
      }, 100);
    });
  });

  describe('syncDataSource', () => {
    it('should sync data source if confirmed', (done) => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      dataSourceService.syncDataSource.and.returnValue(of(true));
      dataSourceService.getAllDataSources.and.returnValue([mockDataSource]);

      component.syncDataSource(mockDataSource);

      expect(window.confirm).toHaveBeenCalled();
      expect(dataSourceService.syncDataSource).toHaveBeenCalledWith(mockDataSource.id);
      
      setTimeout(() => {
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('synced successfully'));
        done();
      }, 100);
    });

    it('should not sync if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.syncDataSource(mockDataSource);

      expect(dataSourceService.syncDataSource).not.toHaveBeenCalled();
    });

    it('should handle sync failure', (done) => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      dataSourceService.syncDataSource.and.returnValue(of(false));

      component.syncDataSource(mockDataSource);

      setTimeout(() => {
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('failed'));
        done();
      }, 100);
    });
  });

  describe('fetchData', () => {
    it('should fetch data from source', (done) => {
      spyOn(window, 'alert');
      const logSpy = spyOn(console, 'log');
      const mockData = [{ id: 1, value: 100 }];
      dataSourceService.fetchData.and.returnValue(of(mockData));

      component.fetchData(mockDataSource);

      setTimeout(() => {
        expect(logSpy).toHaveBeenCalledWith('Fetched data:', mockData);
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('1 records'));
        done();
      }, 100);
    });

    it('should handle fetch error', (done) => {
      spyOn(window, 'alert');
      dataSourceService.fetchData.and.returnValue(
        throwError(() => new Error('Fetch failed'))
      );

      component.fetchData(mockDataSource);

      setTimeout(() => {
        expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('failed'));
        done();
      }, 100);
    });
  });

  describe('toggleCreateForm', () => {
    it('should toggle create form', () => {
      expect(component.showCreateForm).toBe(false);

      component.toggleCreateForm();
      expect(component.showCreateForm).toBe(true);

      component.toggleCreateForm();
      expect(component.showCreateForm).toBe(false);
    });

    it('should reset form when toggling off', () => {
      component.showCreateForm = true;
      component.newDataSource.name = 'Test';
      component.selectedTemplate = mockTemplate;

      component.toggleCreateForm();

      expect(component.newDataSource.name).toBe('');
      expect(component.selectedTemplate).toBeNull();
    });
  });

  describe('resetForm', () => {
    it('should reset all form fields', () => {
      component.newDataSource.name = 'Test';
      component.selectedTemplate = mockTemplate;
      component.editingDataSource = mockDataSource;
      component.showCreateForm = true;

      component.resetForm();

      expect(component.newDataSource.name).toBe('');
      expect(component.selectedTemplate).toBeNull();
      expect(component.editingDataSource).toBeNull();
      expect(component.showCreateForm).toBe(false);
    });
  });

  describe('cancelEdit', () => {
    it('should cancel editing', () => {
      component.editingDataSource = mockDataSource;
      component.showCreateForm = true;

      component.cancelEdit();

      expect(component.editingDataSource).toBeNull();
      expect(component.showCreateForm).toBe(false);
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icon for each status', () => {
      expect(component.getStatusIcon('connected')).toBe('✅');
      expect(component.getStatusIcon('disconnected')).toBe('⭕');
      expect(component.getStatusIcon('error')).toBe('❌');
      expect(component.getStatusIcon('testing')).toBe('⏳');
      expect(component.getStatusIcon('unknown')).toBe('❓');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(component.getStatusColor('connected')).toBe('#10b981');
      expect(component.getStatusColor('disconnected')).toBe('#6b7280');
      expect(component.getStatusColor('error')).toBe('#ef4444');
      expect(component.getStatusColor('testing')).toBe('#f59e0b');
    });
  });

  describe('getTypeIcon', () => {
    it('should return icon from template', () => {
      component.templates = [mockTemplate];
      expect(component.getTypeIcon('postgresql')).toBe('🐘');
    });

    it('should return default icon for unknown type', () => {
      component.templates = [];
      expect(component.getTypeIcon('postgresql')).toBe('🔌');
    });
  });

  describe('formatDate', () => {
    it('should format date', () => {
      const date = new Date('2024-01-01T12:00:00');
      const formatted = component.formatDate(date);
      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe('Never');
    });

    it('should return "Never" for undefined', () => {
      const formatted = component.formatDate(undefined);
      expect(formatted).toBe('Never');
    });
  });

  describe('getTypeCount', () => {
    it('should return count of types', () => {
      component.statistics = {
        total: 5,
        connected: 3,
        byType: {
          postgresql: 2,
          mysql: 1,
          mongodb: 2
        }
      };

      expect(component.getTypeCount()).toBe(3);
    });

    it('should return 0 if no statistics', () => {
      component.statistics = null;
      expect(component.getTypeCount()).toBe(0);
    });

    it('should return 0 if byType is empty', () => {
      component.statistics = {
        total: 0,
        connected: 0,
        byType: {}
      };

      expect(component.getTypeCount()).toBe(0);
    });
  });

  describe('editDataSource', () => {
    it('should set editing data source and show form', () => {
      component.editDataSource(mockDataSource);

      expect(component.editingDataSource).toBeDefined();
      expect(component.editingDataSource?.id).toBe(mockDataSource.id);
      expect(component.showCreateForm).toBe(true);
    });
  });
});

