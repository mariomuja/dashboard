import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataSourceService } from './data-source.service';

export interface ChartConfig {
  id: string;
  name: string;
  description?: string;
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'doughnut';
  dataSource: {
    type: 'datasource' | 'static' | 'calculated';
    sourceId?: string;
    query?: string;
    jsonPath?: string;
    tableName?: string;
    xAxisColumn?: string;
    yAxisColumn?: string;
    staticData?: Array<{ label: string; value: number }>;
  };
  styling: {
    colors?: string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number; // For line smoothness
    showLegend?: boolean;
    showGrid?: boolean;
    height?: number;
  };
  axes?: {
    xAxis?: {
      label?: string;
      type?: 'category' | 'time' | 'linear';
    };
    yAxis?: {
      label?: string;
      min?: number;
      max?: number;
    };
  };
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChartConfigService {
  private readonly STORAGE_KEY = 'dashboard_chart_configs';
  private configsSubject: BehaviorSubject<ChartConfig[]>;
  public configs$: Observable<ChartConfig[]>;

  constructor(private dataSourceService: DataSourceService) {
    this.configsSubject = new BehaviorSubject<ChartConfig[]>(this.loadConfigs());
    this.configs$ = this.configsSubject.asObservable();
  }

  // Get all chart configs
  getConfigs(): ChartConfig[] {
    return this.configsSubject.value;
  }

  // Get visible chart configs
  getVisibleConfigs(): ChartConfig[] {
    return this.getConfigs()
      .filter(c => c.visible)
      .sort((a, b) => a.order - b.order);
  }

  // Get config by ID
  getConfigById(id: string): ChartConfig | undefined {
    return this.getConfigs().find(c => c.id === id);
  }

  // Get configs by chart type
  getConfigsByType(chartType: string): ChartConfig[] {
    return this.getConfigs().filter(c => c.chartType === chartType);
  }

  // Create new chart config
  createConfig(config: Omit<ChartConfig, 'id' | 'createdAt' | 'updatedAt'>): ChartConfig {
    const newConfig: ChartConfig = {
      ...config,
      id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const configs = [...this.getConfigs(), newConfig];
    this.saveConfigs(configs);
    return newConfig;
  }

  // Update chart config
  updateConfig(id: string, updates: Partial<ChartConfig>): boolean {
    const configs = this.getConfigs();
    const index = configs.findIndex(c => c.id === id);
    
    if (index !== -1) {
      configs[index] = {
        ...configs[index],
        ...updates,
        updatedAt: new Date()
      };
      this.saveConfigs(configs);
      return true;
    }
    return false;
  }

  // Delete chart config
  deleteConfig(id: string): boolean {
    const configs = this.getConfigs().filter(c => c.id !== id);
    this.saveConfigs(configs);
    return true;
  }

  // Fetch chart data based on configuration
  async fetchChartData(config: ChartConfig): Promise<Array<{ label: string; value: number }>> {
    try {
      switch (config.dataSource.type) {
        case 'static':
          return config.dataSource.staticData || [];

        case 'datasource':
          return await this.fetchFromDataSource(config);

        case 'calculated':
          // TODO: Implement calculated charts
          return [];

        default:
          return [];
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return [];
    }
  }

  private async fetchFromDataSource(config: ChartConfig): Promise<Array<{ label: string; value: number }>> {
    const sourceId = config.dataSource.sourceId;
    if (!sourceId) {
      return [];
    }

    const dataSource = this.dataSourceService.getDataSource(sourceId);
    if (!dataSource) {
      return [];
    }

    // For now, return mock data
    // In production, this would execute the query and return real data
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = Array.from({ length: 7 }, (_, i) => ({
          label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          value: Math.floor(Math.random() * 5000) + 1000
        }));
        resolve(mockData);
      }, 500);
    });
  }

  // Initialize default charts if none exist
  initializeDefaultCharts(): void {
    const existingConfigs = this.getConfigs();
    const existingNames = existingConfigs.map(c => c.name);
    
    // Define all default charts
    const allDefaults = this.getDefaultChartDefinitions();
    
    // Only add charts that don't already exist
    const chartsToAdd = allDefaults.filter(chart => !existingNames.includes(chart.name));
    
    if (chartsToAdd.length > 0) {
      chartsToAdd.forEach(chart => this.createConfig(chart));
      console.log(`Added ${chartsToAdd.length} missing default charts`);
    }
  }

  private getDefaultChartDefinitions(): Omit<ChartConfig, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      const defaultCharts: Omit<ChartConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Revenue Trend',
          description: 'Revenue over time',
          chartType: 'line',
          dataSource: {
            type: 'static',
            staticData: [
              { label: 'Jan', value: 12000 },
              { label: 'Feb', value: 15000 },
              { label: 'Mar', value: 18000 },
              { label: 'Apr', value: 16000 },
              { label: 'May', value: 21000 },
              { label: 'Jun', value: 24000 }
            ]
          },
          styling: {
            colors: ['#3b82f6'],
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            showLegend: true,
            showGrid: true
          },
          axes: {
            xAxis: { label: 'Month', type: 'category' },
            yAxis: { label: 'Revenue ($)', min: 0 }
          },
          order: 0,
          visible: true
        },
        {
          name: 'Sales Volume',
          description: 'Sales by product category',
          chartType: 'bar',
          dataSource: {
            type: 'static',
            staticData: [
              { label: 'Electronics', value: 450 },
              { label: 'Clothing', value: 320 },
              { label: 'Home', value: 280 },
              { label: 'Sports', value: 190 }
            ]
          },
          styling: {
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
            showLegend: false,
            showGrid: true
          },
          axes: {
            xAxis: { label: 'Category', type: 'category' },
            yAxis: { label: 'Units Sold', min: 0 }
          },
          order: 1,
          visible: true
        },
        {
          name: 'Conversion Funnel',
          description: 'Conversion rates by stage',
          chartType: 'bar',
          dataSource: {
            type: 'static',
            staticData: [
              { label: 'Visitors', value: 10000 },
              { label: 'Product Views', value: 6500 },
              { label: 'Add to Cart', value: 3200 },
              { label: 'Checkout', value: 1800 },
              { label: 'Purchase', value: 1250 }
            ]
          },
          styling: {
            colors: ['#3b82f6'],
            showLegend: false,
            showGrid: true
          },
          axes: {
            xAxis: { label: 'Stage', type: 'category' },
            yAxis: { label: 'Users', min: 0 }
          },
          order: 2,
          visible: true
        },
        {
          name: 'Revenue by Category',
          description: 'Revenue distribution by product category',
          chartType: 'pie',
          dataSource: {
            type: 'static',
            staticData: [
              { label: 'Products', value: 45 },
              { label: 'Services', value: 30 },
              { label: 'Subscriptions', value: 20 },
              { label: 'Other', value: 5 }
            ]
          },
          styling: {
            colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
            showLegend: true,
            showGrid: false
          },
          order: 3,
          visible: true
        },
        {
          name: 'Goals & Targets',
          description: 'Progress towards goals',
          chartType: 'bar',
          dataSource: {
            type: 'static',
            staticData: [
              { label: 'Revenue Target', value: 83 },
              { label: 'Customer Goal', value: 82 },
              { label: 'Conversion Goal', value: 81 }
            ]
          },
          styling: {
            colors: ['#10b981', '#3b82f6', '#8b5cf6'],
            showLegend: false,
            showGrid: false
          },
          order: 4,
          visible: true
        }
      ];
  }

  // Storage
  private loadConfigs(): ChartConfig[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));
    }
    return [];
  }

  private saveConfigs(configs: ChartConfig[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    this.configsSubject.next(configs);
  }
}



