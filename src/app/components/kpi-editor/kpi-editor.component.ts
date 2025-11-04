import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { KpiConfigService, KPIConfig } from '../../services/kpi-config.service';
import { DataSourceService, DataSource } from '../../services/data-source.service';

@Component({
  selector: 'app-kpi-editor',
  templateUrl: './kpi-editor.component.html',
  styleUrls: ['./kpi-editor.component.css']
})
export class KpiEditorComponent implements OnInit {
  @Input() kpiId?: string; // If editing existing KPI
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<KPIConfig>();

  isEditMode = false;
  dataSources: DataSource[] = [];
  
  // Form model
  kpi: Partial<KPIConfig> = {
    name: '',
    description: '',
    icon: '📊',
    dataSource: {
      type: 'static',
      staticValue: 0
    },
    formatting: {
      decimals: 0,
      format: 'number'
    },
    trend: {
      enabled: true,
      comparisonPeriod: 'previous',
      showPercentage: true
    },
    target: {
      enabled: false
    },
    visible: true,
    order: 0
  };

  // UI state
  selectedDataSourceType: 'static' | 'datasource' | 'calculated' = 'static';
  selectedDataSourceId = '';
  testResult: any = null;
  isTesting = false;

  // Icon options
  iconOptions = ['📊', '💰', '📈', '📉', '👥', '📦', '💳', '🎯', '⚡', '🔥', '💎', '🚀', '📱', '💻', '🌍'];

  constructor(
    private kpiConfigService: KpiConfigService,
    private dataSourceService: DataSourceService
  ) {}

  ngOnInit(): void {
    this.dataSources = this.dataSourceService.getDataSources();
    
    if (this.kpiId) {
      this.isEditMode = true;
      const existing = this.kpiConfigService.getConfigById(this.kpiId);
      if (existing) {
        this.kpi = { ...existing };
        this.selectedDataSourceType = this.kpi.dataSource!.type!;
        this.selectedDataSourceId = this.kpi.dataSource!.sourceId || '';
      }
    }
  }

  onDataSourceTypeChange(): void {
    this.kpi.dataSource = {
      type: this.selectedDataSourceType
    };

    if (this.selectedDataSourceType === 'static') {
      this.kpi.dataSource.staticValue = 0;
    }
  }

  onDataSourceIdChange(): void {
    if (this.kpi.dataSource) {
      this.kpi.dataSource.sourceId = this.selectedDataSourceId;
    }
  }

  testConnection(): void {
    this.isTesting = true;
    this.testResult = null;

    // Simulate testing connection
    setTimeout(() => {
      if (this.selectedDataSourceType === 'static') {
        this.testResult = {
          success: true,
          value: this.kpi.dataSource?.staticValue || 0,
          message: 'Static value configured successfully'
        };
      } else if (this.selectedDataSourceType === 'datasource' && this.selectedDataSourceId) {
        const source = this.dataSources.find(ds => ds.id === this.selectedDataSourceId);
        this.testResult = {
          success: true,
          value: Math.floor(Math.random() * 10000),
          message: `Connected to ${source?.name || 'data source'} successfully`
        };
      } else {
        this.testResult = {
          success: false,
          message: 'Please configure data source settings'
        };
      }
      this.isTesting = false;
    }, 1000);
  }

  save(): void {
    if (!this.kpi.name) {
      alert('Please enter a KPI name');
      return;
    }

    const kpiData: any = {
      name: this.kpi.name,
      description: this.kpi.description || '',
      icon: this.kpi.icon || '📊',
      dataSource: this.kpi.dataSource,
      formatting: this.kpi.formatting,
      trend: this.kpi.trend,
      target: this.kpi.target,
      visible: this.kpi.visible !== false,
      order: this.kpi.order || 0
    };

    if (this.isEditMode && this.kpiId) {
      this.kpiConfigService.updateConfig(this.kpiId, kpiData);
      const updated = this.kpiConfigService.getConfigById(this.kpiId);
      if (updated) {
        this.saved.emit(updated);
      }
    } else {
      const created = this.kpiConfigService.createConfig(kpiData);
      this.saved.emit(created);
    }

    this.close.emit();
  }

  cancel(): void {
    this.close.emit();
  }

  deleteKpi(): void {
    if (this.kpiId && confirm('Delete this KPI? This action cannot be undone.')) {
      this.kpiConfigService.deleteConfig(this.kpiId);
      this.close.emit();
    }
  }
}
