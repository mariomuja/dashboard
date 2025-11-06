import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartConfigService, ChartConfig } from '../../services/chart-config.service';
import { DataSourceService, DataSource } from '../../services/data-source.service';

@Component({
  selector: 'app-chart-editor',
  templateUrl: './chart-editor.component.html',
  styleUrls: ['./chart-editor.component.css']
})
export class ChartEditorComponent implements OnInit {
  @Input() chartId?: string;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ChartConfig>();

  isEditMode = false;
  dataSources: DataSource[] = [];
  
  // Form model
  chart: Partial<ChartConfig> = {
    name: '',
    description: '',
    chartType: 'line',
    dataSource: {
      type: 'static',
      staticData: []
    },
    styling: {
      colors: ['#3b82f6'],
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      showLegend: true,
      showGrid: true
    },
    axes: {
      xAxis: { label: 'X Axis', type: 'category' },
      yAxis: { label: 'Y Axis', min: 0 }
    },
    visible: true,
    order: 0
  };

  selectedDataSourceType: 'static' | 'datasource' | 'calculated' = 'static';
  selectedDataSourceId = '';
  
  // Static data management
  newLabel = '';
  newValue = 0;
  
  // UI state
  testResult: any = null;
  isTesting = false;
  showPreview = false;

  // Predefined color schemes
  colorSchemes = [
    { name: 'Blue', colors: ['#3b82f6', '#60a5fa', '#93c5fd'] },
    { name: 'Green', colors: ['#10b981', '#34d399', '#6ee7b7'] },
    { name: 'Multi', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] },
    { name: 'Warm', colors: ['#ef4444', '#f59e0b', '#eab308'] },
    { name: 'Cool', colors: ['#06b6d4', '#3b82f6', '#8b5cf6'] }
  ];

  constructor(
    private chartConfigService: ChartConfigService,
    private dataSourceService: DataSourceService
  ) {}

  ngOnInit(): void {
    this.dataSources = this.dataSourceService.getAllDataSources();
    
    if (this.chartId) {
      this.isEditMode = true;
      const existing = this.chartConfigService.getConfigById(this.chartId);
      if (existing) {
        this.chart = { ...existing };
        this.selectedDataSourceType = this.chart.dataSource!.type!;
        this.selectedDataSourceId = this.chart.dataSource!.sourceId || '';
      }
    }
  }

  onDataSourceTypeChange(): void {
    this.chart.dataSource = {
      type: this.selectedDataSourceType,
      staticData: this.selectedDataSourceType === 'static' ? [] : undefined
    };
  }

  onDataSourceIdChange(): void {
    if (this.chart.dataSource) {
      this.chart.dataSource.sourceId = this.selectedDataSourceId;
    }
  }

  addStaticDataPoint(): void {
    if (!this.newLabel || this.newValue === undefined) {
      alert('Please enter both label and value');
      return;
    }

    if (!this.chart.dataSource!.staticData) {
      this.chart.dataSource!.staticData = [];
    }

    this.chart.dataSource!.staticData.push({
      label: this.newLabel,
      value: this.newValue
    });

    this.newLabel = '';
    this.newValue = 0;
  }

  removeStaticDataPoint(index: number): void {
    if (this.chart.dataSource!.staticData) {
      this.chart.dataSource!.staticData.splice(index, 1);
    }
  }

  applyColorScheme(colors: string[]): void {
    if (this.chart.styling) {
      this.chart.styling.colors = [...colors];
    }
  }

  testConnection(): void {
    this.isTesting = true;
    this.testResult = null;

    setTimeout(() => {
      if (this.selectedDataSourceType === 'static') {
        this.testResult = {
          success: true,
          dataPoints: this.chart.dataSource?.staticData?.length || 0,
          message: 'Static data configured successfully'
        };
      } else if (this.selectedDataSourceType === 'datasource' && this.selectedDataSourceId) {
        const source = this.dataSources.find(ds => ds.id === this.selectedDataSourceId);
        this.testResult = {
          success: true,
          dataPoints: 10,
          message: `Connected to ${source?.name || 'data source'} - sample data retrieved`
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
    if (!this.chart.name) {
      alert('Please enter a chart name');
      return;
    }

    const chartData: any = {
      name: this.chart.name,
      description: this.chart.description || '',
      chartType: this.chart.chartType,
      dataSource: this.chart.dataSource,
      styling: this.chart.styling,
      axes: this.chart.axes,
      visible: this.chart.visible !== false,
      order: this.chart.order || 0
    };

    if (this.isEditMode && this.chartId) {
      this.chartConfigService.updateConfig(this.chartId, chartData);
      const updated = this.chartConfigService.getConfigById(this.chartId);
      if (updated) {
        this.saved.emit(updated);
      }
    } else {
      const created = this.chartConfigService.createConfig(chartData);
      this.saved.emit(created);
    }

    this.close.emit();
  }

  cancel(): void {
    this.close.emit();
  }

  deleteChart(): void {
    if (this.chartId && confirm('Delete this chart? This action cannot be undone.')) {
      this.chartConfigService.deleteConfig(this.chartId);
      this.close.emit();
    }
  }
}
