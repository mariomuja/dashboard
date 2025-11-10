import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
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
  private readonly VERSION_KEY = 'dashboard_kpi_version';
  private readonly CURRENT_VERSION = '2.0'; // Incremented to force reset
  private configsSubject: BehaviorSubject<KPIConfig[]>;
  public configs$: Observable<KPIConfig[]>;

  constructor(
    private dataSourceService: DataSourceService,
    private http: HttpClient
  ) {
    this.checkVersionAndReset();
    this.configsSubject = new BehaviorSubject<KPIConfig[]>(this.loadConfigs());
    this.configs$ = this.configsSubject.asObservable();
    this.migrateStaticToDatasource();
  }
  
  // Check version and reset localStorage if needed
  private checkVersionAndReset(): void {
    const storedVersion = localStorage.getItem(this.VERSION_KEY);
    
    if (storedVersion !== this.CURRENT_VERSION) {
      console.log('[KPI Config] Version mismatch - resetting localStorage');
      console.log(`[KPI Config] Old version: ${storedVersion}, New version: ${this.CURRENT_VERSION}`);
      
      // Clear old KPI configs
      localStorage.removeItem(this.STORAGE_KEY);
      
      // Set new version
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
      
      console.log('[KPI Config] localStorage reset complete - fresh KPIs will be initialized');
    }
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
    console.log('[KPI Config] Fetching data for:', config.name);
    
    // Try to fetch from dashboard API endpoint
    try {
      const apiUrl = '/api/data/dashboard-data';
      console.log('[KPI Config] Calling API:', apiUrl);
      
      const response = await firstValueFrom(this.http.get<any>(apiUrl));
      console.log('[KPI Config] API Response:', response);
      
      if (response && response.kpi && response.kpi.week) {
        console.log('[KPI Config] Available KPIs:', response.kpi.week.map((k: any) => k.title));
        
        // Find matching KPI by name (exact match or contains)
        const kpiData = response.kpi.week.find((k: any) => 
          k.title === config.name || 
          k.title.toLowerCase().includes(config.name.toLowerCase()) || 
          config.name.toLowerCase().includes(k.title.toLowerCase())
        );
        
        if (kpiData) {
          const parsedValue = this.parseValue(kpiData.value);
          console.log('[KPI Config] ✓ Found match for', config.name, '→', kpiData.title, '=', parsedValue);
          
          return {
            value: parsedValue,
            change: kpiData.change || 0,
            trend: kpiData.trend || 'up'
          };
        } else {
          console.warn('[KPI Config] ✗ No match found for:', config.name);
        }
      } else {
        console.error('[KPI Config] Invalid API response structure');
      }
    } catch (error) {
      console.error('[KPI Config] API Error:', error);
    }

    // If no data found, return zero (not NaN)
    console.warn('[KPI Config] Returning default value for:', config.name);
    return {
      value: 0,
      change: 0,
      trend: 'stable' as 'up' | 'down'
    };
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

