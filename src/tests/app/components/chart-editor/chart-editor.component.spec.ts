import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ChartEditorComponent } from '../../../../app/components/chart-editor/chart-editor.component';
import { ChartConfigService } from '../../../../app/services/chart-config.service';
import { DataSourceService, DataSource } from '../../../../app/services/data-source.service';

describe('ChartEditorComponent', () => {
  let component: ChartEditorComponent;
  let fixture: ComponentFixture<ChartEditorComponent>;
  let chartConfigService: jasmine.SpyObj<ChartConfigService>;
  let dataSourceService: jasmine.SpyObj<DataSourceService>;

  const mockDataSources: DataSource[] = [
    {
      id: 'ds-1',
      name: 'PostgreSQL',
      type: 'postgresql',
      status: 'connected',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'test'
      },
      credentials: {},
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    const chartConfigSpy = jasmine.createSpyObj('ChartConfigService', [
      'getConfigById',
      'createConfig',
      'updateConfig',
      'deleteConfig'
    ]);

    const dataSourceSpy = jasmine.createSpyObj('DataSourceService', [
      'getAllDataSources',
      'getDataSource'
    ]);

    dataSourceSpy.getAllDataSources.and.returnValue(mockDataSources);

    await TestBed.configureTestingModule({
      declarations: [ChartEditorComponent],
      imports: [FormsModule, RouterTestingModule],
      providers: [
        { provide: ChartConfigService, useValue: chartConfigSpy },
        { provide: DataSourceService, useValue: dataSourceSpy }
      ]
    }).compileComponents();

    chartConfigService = TestBed.inject(ChartConfigService) as jasmine.SpyObj<ChartConfigService>;
    dataSourceService = TestBed.inject(DataSourceService) as jasmine.SpyObj<DataSourceService>;

    fixture = TestBed.createComponent(ChartEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values for new chart', () => {
    fixture.detectChanges();

    expect(component.isEditMode).toBe(false);
    expect(component.chart.name).toBe('');
    expect(component.chart.chartType).toBe('line');
    expect(component.chart.dataSource?.type).toBe('static');
    expect(component.chart.visible).toBe(true);
  });

  it('should load data sources on init', () => {
    fixture.detectChanges();

    expect(dataSourceService.getAllDataSources).toHaveBeenCalled();
    expect(component.dataSources.length).toBe(1);
  });

  it('should add static data point', () => {
    component.newLabel = 'January';
    component.newValue = 100;

    component.addStaticDataPoint();

    expect(component.chart.dataSource?.staticData?.length).toBe(1);
    expect(component.chart.dataSource?.staticData?.[0].label).toBe('January');
    expect(component.chart.dataSource?.staticData?.[0].value).toBe(100);
    expect(component.newLabel).toBe('');
    expect(component.newValue).toBe(0);
  });

  it('should not add data point without label', () => {
    component.newLabel = '';
    component.newValue = 100;

    spyOn(window, 'alert');
    component.addStaticDataPoint();

    expect(window.alert).toHaveBeenCalled();
    expect(component.chart.dataSource?.staticData?.length).toBeFalsy();
  });

  it('should remove static data point', () => {
    component.chart.dataSource = {
      type: 'static',
      staticData: [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 }
      ]
    };

    component.removeStaticDataPoint(0);

    expect(component.chart.dataSource.staticData.length).toBe(1);
    expect(component.chart.dataSource.staticData[0].label).toBe('B');
  });

  it('should apply color scheme', () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b'];
    component.applyColorScheme(colors);

    expect(component.chart.styling?.colors).toEqual(colors);
  });

  it('should save new chart', () => {
    const newConfig = {
      id: 'chart-new',
      name: 'New Chart',
      chartType: 'bar' as const,
      dataSource: { type: 'static' as const, staticData: [] },
      styling: { colors: ['#3b82f6'] },
      order: 0,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.chart.name = 'New Chart';
    component.chart.chartType = 'bar';
    chartConfigService.createConfig.and.returnValue(newConfig);

    spyOn(component.saved, 'emit');
    spyOn(component.close, 'emit');

    component.save();

    expect(chartConfigService.createConfig).toHaveBeenCalled();
    expect(component.saved.emit).toHaveBeenCalledWith(newConfig);
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not save without chart name', () => {
    component.chart.name = '';
    spyOn(window, 'alert');

    component.save();

    expect(window.alert).toHaveBeenCalledWith('Please enter a chart name');
    expect(chartConfigService.createConfig).not.toHaveBeenCalled();
  });

  it('should test connection successfully for static data', (done) => {
    component.selectedDataSourceType = 'static';
    component.chart.dataSource = { 
      type: 'static', 
      staticData: [{ label: 'A', value: 100 }] 
    };

    component.testConnection();

    setTimeout(() => {
      expect(component.testResult?.success).toBe(true);
      expect(component.testResult?.dataPoints).toBe(1);
      expect(component.isTesting).toBe(false);
      done();
    }, 1100);
  });

  it('should delete chart', () => {
    component.isEditMode = true;
    component.chartId = 'chart-1';

    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.close, 'emit');

    component.deleteChart();

    expect(chartConfigService.deleteConfig).toHaveBeenCalledWith('chart-1');
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit close event on cancel', () => {
    spyOn(component.close, 'emit');

    component.cancel();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should have predefined color schemes', () => {
    expect(component.colorSchemes.length).toBeGreaterThan(0);
    expect(component.colorSchemes[0].name).toBeDefined();
    expect(component.colorSchemes[0].colors.length).toBeGreaterThan(0);
  });
});

