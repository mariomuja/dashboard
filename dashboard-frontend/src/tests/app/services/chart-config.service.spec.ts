import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChartConfigService, ChartConfig } from '../../../../app/services/chart-config.service';
import { DataSourceService } from '../../../../app/services/data-source.service';

describe('ChartConfigService', () => {
  let service: ChartConfigService;
  let dataSourceService: jasmine.SpyObj<DataSourceService>;

  beforeEach(() => {
    const dataSourceSpy = jasmine.createSpyObj('DataSourceService', [
      'getDataSource',
      'getAllDataSources'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ChartConfigService,
        { provide: DataSourceService, useValue: dataSourceSpy }
      ]
    });

    service = TestBed.inject(ChartConfigService);
    dataSourceService = TestBed.inject(DataSourceService) as jasmine.SpyObj<DataSourceService>;
    
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Configuration Management', () => {
    it('should create a new chart config', () => {
      const config = {
        name: 'Test Chart',
        description: 'Test Description',
        chartType: 'line' as const,
        dataSource: {
          type: 'static' as const,
          staticData: [
            { label: 'Jan', value: 100 },
            { label: 'Feb', value: 200 }
          ]
        },
        styling: {
          colors: ['#3b82f6'],
          borderWidth: 2,
          showLegend: true,
          showGrid: true
        },
        order: 0,
        visible: true
      };

      const created = service.createConfig(config);

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Test Chart');
      expect(created.chartType).toBe('line');
      expect(created.createdAt).toBeInstanceOf(Date);
    });

    it('should get all configs', () => {
      service.createConfig({
        name: 'Chart 1',
        chartType: 'bar',
        dataSource: { type: 'static', staticData: [] },
        styling: { colors: ['#3b82f6'] },
        order: 0,
        visible: true
      });

      const configs = service.getConfigs();
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should get visible configs only', () => {
      service.createConfig({
        name: 'Visible Chart',
        chartType: 'line',
        dataSource: { type: 'static', staticData: [] },
        styling: {},
        order: 0,
        visible: true
      });

      service.createConfig({
        name: 'Hidden Chart',
        chartType: 'bar',
        dataSource: { type: 'static', staticData: [] },
        styling: {},
        order: 1,
        visible: false
      });

      const visible = service.getVisibleConfigs();
      expect(visible.length).toBe(1);
      expect(visible[0].name).toBe('Visible Chart');
    });

    it('should get configs by type', () => {
      service.createConfig({
        name: 'Line Chart',
        chartType: 'line',
        dataSource: { type: 'static', staticData: [] },
        styling: {},
        order: 0,
        visible: true
      });

      service.createConfig({
        name: 'Bar Chart',
        chartType: 'bar',
        dataSource: { type: 'static', staticData: [] },
        styling: {},
        order: 1,
        visible: true
      });

      const lineCharts = service.getConfigsByType('line');
      expect(lineCharts.length).toBe(1);
      expect(lineCharts[0].chartType).toBe('line');
    });

    it('should update a config', () => {
      const created = service.createConfig({
        name: 'Original Chart',
        chartType: 'line',
        dataSource: { type: 'static', staticData: [] },
        styling: {},
        order: 0,
        visible: true
      });

      const updated = service.updateConfig(created.id, { name: 'Updated Chart' });
      expect(updated).toBe(true);

      const config = service.getConfigById(created.id);
      expect(config?.name).toBe('Updated Chart');
    });

    it('should delete a config', () => {
      const created = service.createConfig({
        name: 'To Delete',
        chartType: 'line',
        dataSource: { type: 'static', staticData: [] },
        styling: {},
        order: 0,
        visible: true
      });

      service.deleteConfig(created.id);
      const config = service.getConfigById(created.id);
      expect(config).toBeUndefined();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch static data', async () => {
      const config: ChartConfig = {
        id: 'test-1',
        name: 'Static Chart',
        chartType: 'line',
        dataSource: {
          type: 'static',
          staticData: [
            { label: 'A', value: 10 },
            { label: 'B', value: 20 }
          ]
        },
        styling: {},
        order: 0,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const data = await service.fetchChartData(config);
      expect(data.length).toBe(2);
      expect(data[0].label).toBe('A');
      expect(data[0].value).toBe(10);
    });

    it('should return empty array for datasource without sourceId', async () => {
      const config: ChartConfig = {
        id: 'test-2',
        name: 'No Source Chart',
        chartType: 'bar',
        dataSource: {
          type: 'datasource'
        },
        styling: {},
        order: 0,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const data = await service.fetchChartData(config);
      expect(data).toEqual([]);
    });
  });

  describe('Initialization', () => {
    it('should initialize default charts if none exist', () => {
      service.initializeDefaultCharts();
      const configs = service.getConfigs();
      expect(configs.length).toBeGreaterThan(0);
    });

    it('should not reinitialize if charts already exist', () => {
      service.createConfig({
        name: 'Existing Chart',
        chartType: 'line',
        dataSource: { type: 'static', staticData: [] },
        styling: {},
        order: 0,
        visible: true
      });

      const countBefore = service.getConfigs().length;
      service.initializeDefaultCharts();
      const countAfter = service.getConfigs().length;

      expect(countAfter).toBe(countBefore);
    });
  });
});

