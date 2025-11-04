import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataSourceService } from './data-source.service';
import { HttpClient } from '@angular/common/http';

export interface KPIConfig {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  dataSource: {
    type: 'datasource' | 'static' | 'calculated';
    sourceId?: string; // Reference to data source from DataSourceService
    query?: string; // SQL query or API endpoint
    jsonPath?: string; // JSON path to extract value (e.g., "data.metrics.revenue")
    tableName?: string; // Database table name
    columnName?: string; // Database column name
    filePath?: string; // File path for CSV/Excel
    staticValue?: number; // For static KPIs
    calculationFormula?: string; // For calculated KPIs
  };
  formatting: {
    prefix?: string; // e.g., "$", "€"
    suffix?: string; // e.g., "%", "K", "M"
    decimals?: number;
    format?: 'number' | 'currency' | 'percentage';
  };
  trend?: {
    enabled: boolean;
    comparisonPeriod?: 'previous' | 'lastYear' | 'custom';
    showPercentage?: boolean;
  };
  target?: {
    enabled: boolean;
    value?: number;
    comparison?: 'greater' | 'less';
  };
  refreshInterval?: number; // Seconds
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class KpiConfigService {
  private readonly STORAGE_KEY = 'dashboard_kpi_configs';
  private configsSubject: BehaviorSubject<KPIConfig[]>;
  public configs$: Observable<KPIConfig[]>;

  constructor(
    private dataSourceService: DataSourceService,
    private http: HttpClient
  ) {
    this.configsSubject = new BehaviorSubject<KPIConfig[]>(this.loadConfigs());
    this.configs$ = this.configsSubject.asObservable();
  }

  // Get all KPI configs
  getConfigs(): KPIConfig[] {
    return this.configsSubject.value;
  }

  // Get visible KPI configs
  getVisibleConfigs(): KPIConfig[] {
    return this.getConfigs()
      .filter(c => c.visible)
      .sort((a, b) => a.order - b.order);
  }

  // Get config by ID
  getConfigById(id: string): KPIConfig | undefined {
    return this.getConfigs().find(c => c.id === id);
  }

  // Create new KPI config
  createConfig(config: Omit<KPIConfig, 'id' | 'createdAt' | 'updatedAt'>): KPIConfig {
    const newConfig: KPIConfig = {
      ...config,
      id: `kpi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const configs = [...this.getConfigs(), newConfig];
    this.saveConfigs(configs);
    return newConfig;
  }

  // Update KPI config
  updateConfig(id: string, updates: Partial<KPIConfig>): boolean {
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

  // Delete KPI config
  deleteConfig(id: string): boolean {
    const configs = this.getConfigs().filter(c => c.id !== id);
    this.saveConfigs(configs);
    return true;
  }

  // Reorder KPIs
  reorderConfigs(orderedIds: string[]): void {
    const configs = this.getConfigs();
    orderedIds.forEach((id, index) => {
      const config = configs.find(c => c.id === id);
      if (config) {
        config.order = index;
      }
    });
    this.saveConfigs(configs);
  }

  // Fetch KPI value based on configuration
  async fetchKpiValue(config: KPIConfig): Promise<{
    value: number;
    previousValue?: number;
    change?: number;
    trend?: 'up' | 'down';
  }> {
    try {
      switch (config.dataSource.type) {
        case 'static':
          return {
            value: config.dataSource.staticValue || 0
          };

        case 'calculated':
          // TODO: Implement calculated KPIs using formula
          return { value: 0 };

        case 'datasource':
          return await this.fetchFromDataSource(config);

        default:
          return { value: 0 };
      }
    } catch (error) {
      console.error('Error fetching KPI value:', error);
      return { value: 0 };
    }
  }

  private async fetchFromDataSource(config: KPIConfig): Promise<any> {
    const sourceId = config.dataSource.sourceId;
    if (!sourceId) {
      return { value: 0 };
    }

    const dataSource = this.dataSourceService.getDataSourceById(sourceId);
    if (!dataSource) {
      return { value: 0 };
    }

    // For now, return mock data
    // In production, this would connect to the actual data source
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockValue = Math.floor(Math.random() * 10000);
        const previousValue = Math.floor(mockValue * (0.9 + Math.random() * 0.2));
        const change = ((mockValue - previousValue) / previousValue) * 100;
        
        resolve({
          value: mockValue,
          previousValue: previousValue,
          change: parseFloat(change.toFixed(1)),
          trend: change >= 0 ? 'up' : 'down'
        });
      }, 500);
    });
  }

  // Extract value from JSON using path
  private extractValueFromJson(data: any, path: string): number {
    if (!path) return 0;
    
    try {
      const keys = path.split('.');
      let value = data;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return 0;
        }
      }
      
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    } catch (error) {
      console.error('Error extracting value from JSON:', error);
      return 0;
    }
  }

  // Format KPI value
  formatValue(value: number, formatting: KPIConfig['formatting']): string {
    let formatted = value.toFixed(formatting.decimals || 0);
    
    // Add thousand separators
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Add prefix/suffix
    if (formatting.prefix) {
      formatted = formatting.prefix + formatted;
    }
    if (formatting.suffix) {
      formatted = formatted + formatting.suffix;
    }
    
    return formatted;
  }

  // Initialize with default KPIs if none exist
  initializeDefaultKpis(): void {
    if (this.getConfigs().length === 0) {
      const defaultKpis: Omit<KPIConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Total Revenue',
          description: 'Total revenue for the current period',
          icon: '💰',
          dataSource: {
            type: 'static',
            staticValue: 124500
          },
          formatting: {
            prefix: '$',
            decimals: 0,
            format: 'currency'
          },
          trend: {
            enabled: true,
            comparisonPeriod: 'previous',
            showPercentage: true
          },
          order: 0,
          visible: true
        },
        {
          name: 'Total Orders',
          description: 'Number of orders',
          icon: '📦',
          dataSource: {
            type: 'static',
            staticValue: 1250
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
          order: 1,
          visible: true
        },
        {
          name: 'Conversion Rate',
          description: 'Percentage of visitors who convert',
          icon: '📈',
          dataSource: {
            type: 'static',
            staticValue: 3.2
          },
          formatting: {
            suffix: '%',
            decimals: 1,
            format: 'percentage'
          },
          trend: {
            enabled: true,
            comparisonPeriod: 'previous',
            showPercentage: true
          },
          order: 2,
          visible: true
        },
        {
          name: 'Active Users',
          description: 'Currently active users',
          icon: '👥',
          dataSource: {
            type: 'static',
            staticValue: 8456
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
          order: 3,
          visible: true
        }
      ];

      defaultKpis.forEach(kpi => this.createConfig(kpi));
    }
  }

  // Storage
  private loadConfigs(): KPIConfig[] {
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

  private saveConfigs(configs: KPIConfig[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    this.configsSubject.next(configs);
  }
}

