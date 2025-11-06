import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export type DataSourceType = 
  | 'postgresql' 
  | 'mysql' 
  | 'mongodb' 
  | 'snowflake' 
  | 'bigquery'
  | 'rest-api' 
  | 'graphql' 
  | 'aws-cloudwatch'
  | 'azure-monitor'
  | 'gcp-monitoring'
  | 'salesforce' 
  | 'hubspot' 
  | 'google-analytics';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  config: DataSourceConfig;
  credentials: DataSourceCredentials;
  metadata: {
    createdAt: Date;
    lastConnected?: Date;
    lastSync?: Date;
    recordCount?: number;
  };
  tenantId: string;
  organizationId: string;
}

export interface DataSourceConfig {
  // Database config
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  
  // API config
  endpoint?: string;
  apiVersion?: string;
  headers?: { [key: string]: string };
  
  // Query config
  query?: string;
  table?: string;
  collection?: string;
  
  // Data warehouse config
  warehouse?: string;
  project?: string;
  dataset?: string;
  
  // Cloud service config
  region?: string;
  namespace?: string;
  
  // SaaS config
  instanceUrl?: string;
  
  // General
  refreshInterval?: number; // minutes
  timeout?: number; // seconds
}

export interface DataSourceCredentials {
  // Basic auth
  username?: string;
  password?: string;
  
  // API keys
  apiKey?: string;
  apiSecret?: string;
  
  // OAuth
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  
  // Cloud credentials
  serviceAccountKey?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface DataSourceTest {
  success: boolean;
  message: string;
  responseTime?: number;
  recordCount?: number;
  sampleData?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DataSourceService {
  private readonly STORAGE_KEY = 'data_sources';
  private readonly API_URL = 'http://localhost:3007/api/datasources';
  
  private dataSourcesSubject: BehaviorSubject<DataSource[]>;
  public dataSources$: Observable<DataSource[]>;
  
  private dataSources: DataSource[] = [];

  constructor(private http: HttpClient) {
    this.loadDataSources();
    this.dataSourcesSubject = new BehaviorSubject<DataSource[]>(this.dataSources);
    this.dataSources$ = this.dataSourcesSubject.asObservable();
  }

  /**
   * Get all data sources
   */
  getAllDataSources(): DataSource[] {
    return [...this.dataSources];
  }

  /**
   * Get data sources by type
   */
  getDataSourcesByType(type: DataSourceType): DataSource[] {
    return this.dataSources.filter(ds => ds.type === type);
  }

  /**
   * Get data source by ID
   */
  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.find(ds => ds.id === id);
  }

  /**
   * Get connected data sources
   */
  getConnectedDataSources(): DataSource[] {
    return this.dataSources.filter(ds => ds.status === 'connected');
  }

  /**
   * Create new data source
   */
  createDataSource(dataSource: Omit<DataSource, 'id' | 'metadata' | 'status'>): DataSource {
    const newDataSource: DataSource = {
      ...dataSource,
      id: `ds-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'disconnected',
      metadata: {
        createdAt: new Date()
      }
    };

    this.dataSources.push(newDataSource);
    this.saveDataSources();
    this.dataSourcesSubject.next(this.dataSources);

    console.log(`Created data source: ${newDataSource.name} (${newDataSource.type})`);
    return newDataSource;
  }

  /**
   * Update data source
   */
  updateDataSource(id: string, updates: Partial<DataSource>): void {
    const index = this.dataSources.findIndex(ds => ds.id === id);
    if (index > -1) {
      this.dataSources[index] = { ...this.dataSources[index], ...updates };
      this.saveDataSources();
      this.dataSourcesSubject.next(this.dataSources);
      console.log(`Updated data source: ${id}`);
    }
  }

  /**
   * Delete data source
   */
  deleteDataSource(id: string): boolean {
    const index = this.dataSources.findIndex(ds => ds.id === id);
    if (index > -1) {
      const ds = this.dataSources[index];
      this.dataSources.splice(index, 1);
      this.saveDataSources();
      this.dataSourcesSubject.next(this.dataSources);
      console.log(`Deleted data source: ${ds.name}`);
      return true;
    }
    return false;
  }

  /**
   * Test data source connection
   */
  testConnection(dataSource: DataSource): Observable<DataSourceTest> {
    return this.http.post<DataSourceTest>(`${this.API_URL}/test`, {
      type: dataSource.type,
      config: dataSource.config,
      credentials: this.encryptCredentials(dataSource.credentials)
    }).pipe(
      map(result => {
        if (result.success) {
          this.updateDataSource(dataSource.id, {
            status: 'connected',
            metadata: {
              ...dataSource.metadata,
              lastConnected: new Date(),
              recordCount: result.recordCount
            }
          });
        } else {
          this.updateDataSource(dataSource.id, { status: 'error' });
        }
        return result;
      }),
      catchError(error => {
        console.error('Connection test failed:', error);
        this.updateDataSource(dataSource.id, { status: 'error' });
        return of({
          success: false,
          message: error.message || 'Connection failed'
        });
      })
    );
  }

  /**
   * Fetch data from source
   */
  fetchData(dataSourceId: string, query?: string): Observable<any[]> {
    const dataSource = this.getDataSource(dataSourceId);
    if (!dataSource) {
      return of([]);
    }

    return this.http.post<any>(`${this.API_URL}/fetch`, {
      id: dataSourceId,
      type: dataSource.type,
      config: dataSource.config,
      credentials: this.encryptCredentials(dataSource.credentials),
      query
    }).pipe(
      map(response => {
        this.updateDataSource(dataSourceId, {
          metadata: {
            ...dataSource.metadata,
            lastSync: new Date(),
            recordCount: response.data?.length
          }
        });
        return response.data || [];
      }),
      catchError(error => {
        console.error('Data fetch failed:', error);
        return of([]);
      })
    );
  }

  /**
   * Sync data from source
   */
  syncDataSource(dataSourceId: string): Observable<boolean> {
    const dataSource = this.getDataSource(dataSourceId);
    if (!dataSource) {
      return of(false);
    }

    return this.http.post<any>(`${this.API_URL}/sync`, {
      id: dataSourceId,
      type: dataSource.type,
      config: dataSource.config,
      credentials: this.encryptCredentials(dataSource.credentials)
    }).pipe(
      map(response => {
        this.updateDataSource(dataSourceId, {
          status: 'connected',
          metadata: {
            ...dataSource.metadata,
            lastSync: new Date(),
            recordCount: response.recordCount
          }
        });
        return true;
      }),
      catchError(error => {
        console.error('Sync failed:', error);
        this.updateDataSource(dataSourceId, { status: 'error' });
        return of(false);
      })
    );
  }

  /**
   * Get data source templates
   */
  getTemplates(): DataSourceTemplate[] {
    return [
      {
        type: 'postgresql',
        name: 'PostgreSQL Database',
        icon: '🐘',
        description: 'Connect to PostgreSQL database',
        defaultConfig: {
          host: 'localhost',
          port: 5432,
          database: 'mydb',
          schema: 'public'
        }
      },
      {
        type: 'mysql',
        name: 'MySQL Database',
        icon: '🐬',
        description: 'Connect to MySQL/MariaDB database',
        defaultConfig: {
          host: 'localhost',
          port: 3306,
          database: 'mydb'
        }
      },
      {
        type: 'mongodb',
        name: 'MongoDB',
        icon: '🍃',
        description: 'Connect to MongoDB database',
        defaultConfig: {
          host: 'localhost',
          port: 27017,
          database: 'mydb',
          collection: 'metrics'
        }
      },
      {
        type: 'snowflake',
        name: 'Snowflake',
        icon: '❄️',
        description: 'Connect to Snowflake data warehouse',
        defaultConfig: {
          warehouse: 'COMPUTE_WH',
          database: 'ANALYTICS',
          schema: 'PUBLIC'
        }
      },
      {
        type: 'bigquery',
        name: 'Google BigQuery',
        icon: '📊',
        description: 'Connect to BigQuery data warehouse',
        defaultConfig: {
          project: 'my-project',
          dataset: 'analytics'
        }
      },
      {
        type: 'rest-api',
        name: 'REST API',
        icon: '🔌',
        description: 'Connect to REST API endpoint',
        defaultConfig: {
          endpoint: 'https://api.example.com/v1/metrics',
          apiVersion: 'v1'
        }
      },
      {
        type: 'graphql',
        name: 'GraphQL API',
        icon: '⚡',
        description: 'Connect to GraphQL endpoint',
        defaultConfig: {
          endpoint: 'https://api.example.com/graphql'
        }
      },
      {
        type: 'aws-cloudwatch',
        name: 'AWS CloudWatch',
        icon: '☁️',
        description: 'Fetch metrics from AWS CloudWatch',
        defaultConfig: {
          region: 'us-east-1',
          namespace: 'AWS/EC2'
        }
      },
      {
        type: 'azure-monitor',
        name: 'Azure Monitor',
        icon: '🔷',
        description: 'Fetch metrics from Azure Monitor',
        defaultConfig: {
          region: 'eastus'
        }
      },
      {
        type: 'gcp-monitoring',
        name: 'GCP Cloud Monitoring',
        icon: '🔴',
        description: 'Fetch metrics from GCP Monitoring',
        defaultConfig: {
          project: 'my-gcp-project'
        }
      },
      {
        type: 'salesforce',
        name: 'Salesforce',
        icon: '☁️',
        description: 'Connect to Salesforce CRM',
        defaultConfig: {
          instanceUrl: 'https://your-domain.salesforce.com',
          apiVersion: 'v57.0'
        }
      },
      {
        type: 'hubspot',
        name: 'HubSpot',
        icon: '🧡',
        description: 'Connect to HubSpot CRM',
        defaultConfig: {
          endpoint: 'https://api.hubapi.com'
        }
      },
      {
        type: 'google-analytics',
        name: 'Google Analytics',
        icon: '📈',
        description: 'Connect to Google Analytics',
        defaultConfig: {
          apiVersion: 'v4'
        }
      }
    ];
  }

  /**
   * Get data source statistics
   */
  getStatistics(): {
    total: number;
    connected: number;
    byType: { [key: string]: number };
  } {
    const byType: { [key: string]: number } = {};
    
    this.dataSources.forEach(ds => {
      byType[ds.type] = (byType[ds.type] || 0) + 1;
    });

    return {
      total: this.dataSources.length,
      connected: this.dataSources.filter(ds => ds.status === 'connected').length,
      byType
    };
  }

  // Helper methods
  private encryptCredentials(credentials: DataSourceCredentials): DataSourceCredentials {
    // In production, encrypt sensitive data before sending to backend
    // For now, just return as-is (backend should encrypt)
    return credentials;
  }

  private saveDataSources(): void {
    // Only save metadata, not credentials
    const safeData = this.dataSources.map(ds => ({
      ...ds,
      credentials: {} // Don't persist credentials to localStorage
    }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(safeData));
  }

  private loadDataSources(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.dataSources = parsed.map((ds: any) => ({
        ...ds,
        metadata: {
          ...ds.metadata,
          createdAt: new Date(ds.metadata.createdAt),
          lastConnected: ds.metadata.lastConnected ? new Date(ds.metadata.lastConnected) : undefined,
          lastSync: ds.metadata.lastSync ? new Date(ds.metadata.lastSync) : undefined
        }
      }));
    }
  }
}

export interface DataSourceTemplate {
  type: DataSourceType;
  name: string;
  icon: string;
  description: string;
  defaultConfig: Partial<DataSourceConfig>;
}

