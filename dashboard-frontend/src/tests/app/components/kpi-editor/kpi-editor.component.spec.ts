import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { KpiEditorComponent } from '../../../../app/components/kpi-editor/kpi-editor.component';
import { KpiConfigService } from '../../../../app/services/kpi-config.service';
import { DataSourceService, DataSource } from '../../../../app/services/data-source.service';

describe('KpiEditorComponent', () => {
  let component: KpiEditorComponent;
  let fixture: ComponentFixture<KpiEditorComponent>;
  let kpiConfigService: jasmine.SpyObj<KpiConfigService>;
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
      lastSync: new Date(),
      createdAt: new Date()
    }
  ];

  beforeEach(async () => {
    const kpiConfigSpy = jasmine.createSpyObj('KpiConfigService', [
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
      declarations: [KpiEditorComponent],
      imports: [FormsModule],
      providers: [
        { provide: KpiConfigService, useValue: kpiConfigSpy },
        { provide: DataSourceService, useValue: dataSourceSpy }
      ]
    }).compileComponents();

    kpiConfigService = TestBed.inject(KpiConfigService) as jasmine.SpyObj<KpiConfigService>;
    dataSourceService = TestBed.inject(DataSourceService) as jasmine.SpyObj<DataSourceService>;

    fixture = TestBed.createComponent(KpiEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values for new KPI', () => {
    fixture.detectChanges();

    expect(component.isEditMode).toBe(false);
    expect(component.kpi.name).toBe('');
    expect(component.kpi.dataSource?.type).toBe('static');
    expect(component.kpi.formatting?.format).toBe('number');
    expect(component.kpi.visible).toBe(true);
  });

  it('should load existing KPI config in edit mode', () => {
    const existingConfig = {
      id: 'kpi-1',
      name: 'Test KPI',
      icon: '💰',
      dataSource: {
        type: 'static' as const,
        staticValue: 1000
      },
      formatting: {
        prefix: '$',
        decimals: 0,
        format: 'currency' as const
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
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    kpiConfigService.getConfigById.and.returnValue(existingConfig);
    component.kpiId = 'kpi-1';

    fixture.detectChanges();

    expect(component.isEditMode).toBe(true);
    expect(component.kpi.name).toBe('Test KPI');
    expect(component.kpi.icon).toBe('💰');
    expect(component.selectedDataSourceType).toBe('static');
  });

  it('should load data sources on init', () => {
    fixture.detectChanges();

    expect(dataSourceService.getAllDataSources).toHaveBeenCalled();
    expect(component.dataSources.length).toBe(1);
    expect(component.dataSources[0].name).toBe('PostgreSQL');
  });

  it('should change data source type', () => {
    component.selectedDataSourceType = 'datasource';
    component.onDataSourceTypeChange();

    expect(component.kpi.dataSource?.type).toBe('datasource');
  });

  it('should update data source ID', () => {
    component.selectedDataSourceId = 'ds-1';
    component.onDataSourceIdChange();

    expect(component.kpi.dataSource?.sourceId).toBe('ds-1');
  });

  it('should test connection successfully for static value', (done) => {
    component.selectedDataSourceType = 'static';
    component.kpi.dataSource = { type: 'static', staticValue: 500 };

    component.testConnection();

    setTimeout(() => {
      expect(component.testResult?.success).toBe(true);
      expect(component.testResult?.value).toBe(500);
      expect(component.isTesting).toBe(false);
      done();
    }, 1100);
  });

  it('should save new KPI', () => {
    const newConfig = {
      id: 'kpi-new',
      name: 'New KPI',
      icon: '📊',
      dataSource: { type: 'static' as const, staticValue: 100 },
      formatting: { decimals: 0, format: 'number' as const },
      trend: { enabled: false },
      target: { enabled: false },
      order: 0,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.kpi.name = 'New KPI';
    kpiConfigService.createConfig.and.returnValue(newConfig);

    spyOn(component.saved, 'emit');
    spyOn(component.close, 'emit');

    component.save();

    expect(kpiConfigService.createConfig).toHaveBeenCalled();
    expect(component.saved.emit).toHaveBeenCalledWith(newConfig);
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should update existing KPI', () => {
    component.isEditMode = true;
    component.kpiId = 'kpi-1';
    component.kpi.name = 'Updated KPI';

    const updatedConfig = {
      id: 'kpi-1',
      name: 'Updated KPI',
      icon: '📊',
      dataSource: { type: 'static' as const, staticValue: 100 },
      formatting: { decimals: 0, format: 'number' as const },
      trend: { enabled: false },
      target: { enabled: false },
      order: 0,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    kpiConfigService.updateConfig.and.returnValue(true);
    kpiConfigService.getConfigById.and.returnValue(updatedConfig);

    spyOn(component.saved, 'emit');
    spyOn(component.close, 'emit');

    component.save();

    expect(kpiConfigService.updateConfig).toHaveBeenCalledWith('kpi-1', jasmine.any(Object));
    expect(component.saved.emit).toHaveBeenCalledWith(updatedConfig);
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not save without KPI name', () => {
    component.kpi.name = '';
    spyOn(window, 'alert');

    component.save();

    expect(window.alert).toHaveBeenCalledWith('Please enter a KPI name');
    expect(kpiConfigService.createConfig).not.toHaveBeenCalled();
  });

  it('should delete KPI', () => {
    component.isEditMode = true;
    component.kpiId = 'kpi-1';

    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.close, 'emit');

    component.deleteKpi();

    expect(kpiConfigService.deleteConfig).toHaveBeenCalledWith('kpi-1');
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not delete if user cancels confirmation', () => {
    component.isEditMode = true;
    component.kpiId = 'kpi-1';

    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteKpi();

    expect(kpiConfigService.deleteConfig).not.toHaveBeenCalled();
  });

  it('should emit close event on cancel', () => {
    spyOn(component.close, 'emit');

    component.cancel();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should have all icon options', () => {
    expect(component.iconOptions.length).toBeGreaterThan(0);
    expect(component.iconOptions).toContain('📊');
    expect(component.iconOptions).toContain('💰');
  });
});

