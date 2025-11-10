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
    this.migrateStaticToDatasource();
  }
  
  // Migrate old static KPIs to use datasource
  private migrateStaticToDatasource(): void {
    const configs = this.getConfigs();
    let needsSave = false;
    
    configs.forEach(config => {
      if (config.dataSource.type === 'static') {
        console.log('[KPI Config] Migrating', config.name, 'from static to datasource');
        config.dataSource = {
          type: 'datasource',
          query: '/api/data/dashboard-data'
        };
        config.updatedAt = new Date();
        needsSave = true;
      }
    });
    
    if (needsSave) {
      this.saveConfigs(configs);
      console.log('[KPI Config] Migration completed for', configs.length, 'KPIs');
    }
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
    
    // Try to fetch from dashboard API endpoint
    try {
      const apiUrl = '/api/data/dashboard-data';
      const response = await this.http.get<any>(apiUrl).toPromise();
      
      if (response && response.kpi && response.kpi.week) {
        // Find matching KPI by name
        const kpiData = response.kpi.week.find((k: any) => 
          k.title === config.name || 
          k.title.includes(config.name) || 
          config.name.includes(k.title)
        );
        
        if (kpiData) {
          console.log('[KPI Config] Found data for', config.name, ':', kpiData);
          return {
            value: this.parseValue(kpiData.value),
            change: kpiData.change || 0,
            trend: kpiData.trend || 'stable'
          };
        }
      }
    } catch (error) {
      console.error('[KPI Config] Error fetching from API:', error);
    }

    // Fallback to data source if configured
    if (sourceId) {
      const dataSource = this.dataSourceService.getDataSource(sourceId);
      if (dataSource) {
        // TODO: Implement actual data source connection
        console.warn('[KPI Config] Data source connection not yet implemented');
      }
    }

    // Last resort: return mock data
    return new Promise((resolve) => {
      const mockValue = Math.floor(Math.random() * 10000);
      const previousValue = Math.floor(mockValue * (0.9 + Math.random() * 0.2));
      const change = ((mockValue - previousValue) / previousValue) * 100;
      
      resolve({
        value: mockValue,
        previousValue: previousValue,
        change: parseFloat(change.toFixed(1)),
        trend: change >= 0 ? 'up' : 'down'
      });
    });
  }
  
  // Parse value from string (e.g., "$125,430" -> 125430)
  private parseValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      // Remove currency symbols, commas, percentage signs, etc.
      const cleaned = value.replace(/[$,€£¥%\s]/g, '');
      // Extract the number (handle "/5" for ratings)
      const match = cleaned.match(/^([\d.]+)/);
      if (match) {
        return parseFloat(match[1]);
      }
    }
    return 0;
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
            type: 'datasource',
            query: '/api/data/dashboard-data'
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
          name: 'Active Users',
          description: 'Currently active users',
          icon: '👥',
          dataSource: {
            type: 'datasource',
            query: '/api/data/dashboard-data'
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
            type: 'datasource',
            query: '/api/data/dashboard-data'
          },
          formatting: {
            suffix: '%',
            decimals: 2,
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
          name: 'Customer Satisfaction',
          description: 'Average customer satisfaction rating',
          icon: '⭐',
          dataSource: {
            type: 'datasource',
            query: '/api/data/dashboard-data'
          },
          formatting: {
            suffix: '/5',
            decimals: 1,
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

