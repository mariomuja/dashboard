# Multiple Data Sources Integration Guide

## 🎯 Overview

Connect your KPI dashboard to virtually any data source! This comprehensive guide covers:
- **Databases**: PostgreSQL, MySQL, MongoDB
- **Data Warehouses**: Snowflake, BigQuery
- **APIs**: REST, GraphQL
- **Cloud Services**: AWS CloudWatch, Azure Monitor, GCP Monitoring
- **SaaS Platforms**: Salesforce, HubSpot, Google Analytics

---

## ✨ Features

### ✅ Database Connectors
- 🐘 **PostgreSQL** - Enterprise relational database
- 🐬 **MySQL/MariaDB** - Popular open-source database
- 🍃 **MongoDB** - NoSQL document database

### ✅ Data Warehouse Integration
- ❄️ **Snowflake** - Cloud data warehouse
- 📊 **Google BigQuery** - Serverless data warehouse

### ✅ API Connectors
- 🔌 **REST API** - Connect to any REST endpoint
- ⚡ **GraphQL** - Query GraphQL APIs

### ✅ Cloud Service Metrics
- ☁️ **AWS CloudWatch** - Amazon Web Services monitoring
- 🔷 **Azure Monitor** - Microsoft Azure monitoring
- 🔴 **GCP Cloud Monitoring** - Google Cloud monitoring

### ✅ SaaS Integrations
- ☁️ **Salesforce** - CRM data and analytics
- 🧡 **HubSpot** - Marketing & CRM platform
- 📈 **Google Analytics** - Web analytics data

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

This installs:
- `pg` - PostgreSQL client
- `mysql2` - MySQL client
- `mongodb` - MongoDB driver
- `axios` - HTTP client for APIs

### 2. Start Data Source Service

```bash
npm run start:datasources
```

Service runs on `http://localhost:3007`

### 3. Access Data Sources UI

1. Go to `http://localhost:4200/data-sources`
2. Click **"+ Add Data Source"**
3. Select data source type
4. Configure connection
5. Test connection
6. Save and sync!

---

## 📚 Supported Data Sources

### 1. PostgreSQL 🐘

**Configuration:**
```typescript
{
  host: 'localhost',
  port: 5432,
  database: 'analytics',
  schema: 'public'
}
```

**Credentials:**
```typescript
{
  username: 'postgres',
  password: 'your-password'
}
```

**Use Cases:**
- Enterprise data warehouses
- Transactional data
- Analytical queries

### 2. MySQL 🐬

**Configuration:**
```typescript
{
  host: 'localhost',
  port: 3306,
  database: 'kpi_data'
}
```

**Credentials:**
```typescript
{
  username: 'root',
  password: 'your-password'
}
```

**Use Cases:**
- Web application databases
- E-commerce data
- Content management

### 3. MongoDB 🍃

**Configuration:**
```typescript
{
  host: 'localhost',
  port: 27017,
  database: 'analytics',
  collection: 'kpis'
}
```

**Credentials:**
```typescript
{
  username: 'admin',
  password: 'your-password'
}
```

**Use Cases:**
- Real-time analytics
- JSON/document storage
- IoT data

### 4. Snowflake ❄️

**Configuration:**
```typescript
{
  warehouse: 'COMPUTE_WH',
  database: 'ANALYTICS_DB',
  schema: 'PUBLIC'
}
```

**Credentials:**
```typescript
{
  username: 'snowflake_user',
  password: 'your-password'
}
```

**Use Cases:**
- Large-scale analytics
- Data science workloads
- Multi-cloud data

### 5. Google BigQuery 📊

**Configuration:**
```typescript
{
  project: 'my-gcp-project',
  dataset: 'analytics_dataset'
}
```

**Credentials:**
```typescript
{
  serviceAccountKey: '{...JSON key...}'
}
```

**Use Cases:**
- Petabyte-scale analytics
- Real-time dashboards
- Machine learning data

### 6. REST API 🔌

**Configuration:**
```typescript
{
  endpoint: 'https://api.example.com/v1/metrics',
  apiVersion: 'v1',
  headers: {
    'Content-Type': 'application/json'
  }
}
```

**Credentials:**
```typescript
{
  apiKey: 'your-api-key'
}
```

**Use Cases:**
- Third-party APIs
- Custom backends
- Microservices

### 7. GraphQL ⚡

**Configuration:**
```typescript
{
  endpoint: 'https://api.example.com/graphql',
  query: `{
    metrics {
      name
      value
      timestamp
    }
  }`
}
```

**Credentials:**
```typescript
{
  apiKey: 'your-api-key'
}
```

**Use Cases:**
- Modern APIs
- Efficient data fetching
- Type-safe queries

### 8. AWS CloudWatch ☁️

**Configuration:**
```typescript
{
  region: 'us-east-1',
  namespace: 'AWS/EC2'
}
```

**Credentials:**
```typescript
{
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_KEY'
}
```

**Use Cases:**
- AWS infrastructure metrics
- Application monitoring
- Cost tracking

### 9. Azure Monitor 🔷

**Configuration:**
```typescript
{
  region: 'eastus'
}
```

**Credentials:**
```typescript
{
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
}
```

**Use Cases:**
- Azure resource monitoring
- Application insights
- Performance metrics

### 10. GCP Cloud Monitoring 🔴

**Configuration:**
```typescript
{
  project: 'my-gcp-project'
}
```

**Credentials:**
```typescript
{
  serviceAccountKey: '{...JSON key...}'
}
```

**Use Cases:**
- GCP resource monitoring
- Application performance
- Custom metrics

### 11. Salesforce ☁️

**Configuration:**
```typescript
{
  instanceUrl: 'https://your-domain.salesforce.com',
  apiVersion: 'v57.0'
}
```

**Credentials:**
```typescript
{
  accessToken: 'your-oauth-token',
  refreshToken: 'your-refresh-token'
}
```

**Use Cases:**
- Sales pipeline metrics
- Lead conversion rates
- Revenue tracking

### 12. HubSpot 🧡

**Configuration:**
```typescript
{
  endpoint: 'https://api.hubapi.com'
}
```

**Credentials:**
```typescript
{
  apiKey: 'your-hubspot-api-key'
}
```

**Use Cases:**
- Marketing metrics
- Contact analytics
- Deal tracking

### 13. Google Analytics 📈

**Configuration:**
```typescript
{
  apiVersion: 'v4'
}
```

**Credentials:**
```typescript
{
  serviceAccountKey: '{...JSON key...}',
  viewId: 'your-view-id'
}
```

**Use Cases:**
- Website traffic
- User behavior
- Conversion tracking

---

## 💻 Frontend Usage

### Creating a Data Source

```typescript
import { DataSourceService } from './services/data-source.service';

constructor(private dataSourceService: DataSourceService) {}

createPostgreSQLSource() {
  const dataSource = this.dataSourceService.createDataSource({
    name: 'Production Database',
    type: 'postgresql',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    config: {
      host: 'db.example.com',
      port: 5432,
      database: 'production',
      schema: 'public',
      query: 'SELECT * FROM kpis WHERE date >= NOW() - INTERVAL \'7 days\''
    },
    credentials: {
      username: 'readonly_user',
      password: 'secure-password'
    }
  });
  
  console.log('Created:', dataSource.id);
}
```

### Testing Connection

```typescript
testConnection(dataSource: DataSource) {
  this.dataSourceService.testConnection(dataSource).subscribe(result => {
    if (result.success) {
      console.log('Connected!', result.message);
      console.log('Response time:', result.responseTime, 'ms');
      console.log('Sample data:', result.sampleData);
    } else {
      console.error('Failed:', result.message);
    }
  });
}
```

### Fetching Data

```typescript
fetchKPIData(dataSourceId: string) {
  this.dataSourceService.fetchData(dataSourceId).subscribe(data => {
    console.log('Fetched records:', data.length);
    this.kpiData = this.transformToKPIs(data);
  });
}
```

### Syncing Data

```typescript
syncDataSource(dataSourceId: string) {
  this.dataSourceService.syncDataSource(dataSourceId).subscribe(success => {
    if (success) {
      console.log('Sync completed successfully');
    }
  });
}
```

---

## 🔧 Backend API

### Endpoints

```
POST   /api/datasources/test   - Test connection
POST   /api/datasources/fetch  - Fetch data
POST   /api/datasources/sync   - Sync data
GET    /api/health             - Health check
```

### Test Connection

**Request:**
```json
POST /api/datasources/test
{
  "type": "postgresql",
  "config": {
    "host": "localhost",
    "port": 5432,
    "database": "analytics"
  },
  "credentials": {
    "username": "user",
    "password": "pass"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to PostgreSQL",
  "responseTime": 45,
  "recordCount": 0,
  "sampleData": []
}
```

### Fetch Data

**Request:**
```json
POST /api/datasources/fetch
{
  "id": "ds-123",
  "type": "rest-api",
  "config": {
    "endpoint": "https://api.example.com/metrics"
  },
  "credentials": {
    "apiKey": "your-key"
  },
  "query": "SELECT * FROM metrics"
}
```

**Response:**
```json
{
  "data": [...],
  "recordCount": 150,
  "message": "Data fetched successfully"
}
```

---

## 🔒 Security Best Practices

### 1. Credentials Storage
```typescript
// ❌ DON'T store in localStorage
localStorage.setItem('password', 'secret');

// ✅ DO store in secure backend
// Frontend only keeps reference ID
```

### 2. Encryption
```typescript
// Backend encrypts credentials at rest
const encrypted = encryptAES256(credentials, process.env.ENCRYPTION_KEY);
```

### 3. Read-Only Access
```sql
-- Create read-only database user
CREATE USER readonly_user WITH PASSWORD 'secure-password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### 4. API Key Rotation
```typescript
// Rotate API keys regularly
// Use expiring tokens when possible
```

### 5. IP Whitelisting
```javascript
// Restrict access to known IPs
const allowedIPs = ['192.168.1.100', '10.0.0.50'];
```

---

## 📊 Use Cases

### 1. Multi-Database Dashboard

```typescript
// PostgreSQL for transactional data
const pgSource = createDataSource('postgresql', {...});

// MongoDB for real-time events
const mongoSource = createDataSource('mongodb', {...});

// Combine data
const combinedData = {
  transactions: await fetchData(pgSource.id),
  events: await fetchData(mongoSource.id)
};
```

### 2. Cloud Metrics Dashboard

```typescript
// AWS metrics
const awsSource = createDataSource('aws-cloudwatch', {
  region: 'us-east-1',
  namespace: 'AWS/EC2'
});

// Azure metrics
const azureSource = createDataSource('azure-monitor', {
  region: 'eastus'
});

// Unified cloud metrics view
```

### 3. Sales Analytics from CRM

```typescript
// Salesforce opportunities
const sfSource = createDataSource('salesforce', {
  instanceUrl: 'https://company.salesforce.com'
});

// HubSpot deals
const hsSource = createDataSource('hubspot', {...});

// Combined sales pipeline
```

### 4. Website & Marketing Analytics

```typescript
// Google Analytics traffic
const gaSource = createDataSource('google-analytics', {...});

// HubSpot marketing
const marketingSource = createDataSource('hubspot', {...});

// Complete marketing dashboard
```

---

## 🔧 Configuration Examples

### PostgreSQL with SSL

```typescript
config: {
  host: 'prod-db.example.com',
  port: 5432,
  database: 'analytics',
  schema: 'metrics',
  query: `
    SELECT 
      metric_name,
      metric_value,
      created_at
    FROM kpi_metrics
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  `,
  ssl: true
}
```

### REST API with Custom Headers

```typescript
config: {
  endpoint: 'https://api.company.com/v2/analytics',
  apiVersion: 'v2',
  headers: {
    'X-Custom-Header': 'value',
    'Accept': 'application/json'
  },
  timeout: 30
}
```

### GraphQL with Variables

```typescript
config: {
  endpoint: 'https://api.company.com/graphql',
  query: `
    query GetMetrics($startDate: Date!) {
      metrics(startDate: $startDate) {
        name
        value
        trend
      }
    }
  `
}
```

### MongoDB Aggregation

```typescript
config: {
  host: 'mongo.example.com',
  port: 27017,
  database: 'analytics',
  collection: 'daily_metrics',
  query: JSON.stringify([
    { $match: { date: { $gte: new Date('2024-01-01') } } },
    { $group: { _id: '$category', total: { $sum: '$value' } } }
  ])
}
```

---

## 📈 Data Transformation

### Transform Database Results to KPIs

```typescript
transformToKPIs(data: any[]): KpiData[] {
  return data.map(row => ({
    id: row.id,
    title: row.metric_name,
    value: row.metric_value,
    change: row.change_percent,
    trend: row.trend_direction,
    icon: this.getIcon(row.category),
    color: this.getColor(row.category)
  }));
}
```

### Transform API Response

```typescript
transformAPIData(response: any): ChartDataPoint[] {
  return response.data.metrics.map(m => ({
    label: m.timestamp,
    value: m.value
  }));
}
```

### Transform Cloud Metrics

```typescript
transformCloudWatchMetrics(metrics: any[]): KpiData[] {
  return metrics.map(m => ({
    id: m.MetricName,
    title: m.MetricName,
    value: m.Datapoints[0]?.Average?.toFixed(2) || '0',
    change: this.calculateChange(m.Datapoints),
    trend: this.determineTrend(m.Datapoints),
    icon: '☁️',
    color: '#FF9900'
  }));
}
```

---

## 🔄 Data Refresh Strategies

### 1. Manual Refresh

```typescript
refreshButton.onClick(() => {
  dataSourceService.syncDataSource(dataSourceId);
});
```

### 2. Automatic Refresh

```typescript
// Set refresh interval in config
config: {
  refreshInterval: 5 // minutes
}

// Auto-refresh in component
setInterval(() => {
  this.syncDataSource(dataSourceId);
}, config.refreshInterval * 60 * 1000);
```

### 3. Real-Time with WebSocket

```typescript
// For REST APIs that support WebSocket
const ws = new WebSocket('wss://api.example.com/live');
ws.onmessage = (event) => {
  const newData = JSON.parse(event.data);
  this.updateKPIs(newData);
};
```

### 4. Scheduled Sync

```typescript
// Sync daily at 2 AM
cron.schedule('0 2 * * *', () => {
  dataSources.forEach(ds => {
    dataSourceService.syncDataSource(ds.id);
  });
});
```

---

## 🧪 Testing Connections

### Connection Test Flow

1. **Create data source**
2. **Click "Test Connection"**
3. **Service validates**:
   - Connection parameters
   - Credentials
   - Network reachability
   - Query execution
4. **Results shown**:
   - Success/failure status
   - Response time
   - Sample data
   - Error messages

### Example Test Results

```
✅ PostgreSQL Connection Test
   Status: Success
   Response Time: 45ms
   Records Found: 1,247
   Sample Data: [...]
   
❌ MySQL Connection Test
   Status: Failed
   Error: Access denied for user 'test'@'localhost'
```

---

## 📊 Advanced Features

### Multi-Source Data Aggregation

```typescript
class AggregatedDataService {
  async getCombinedKPIs() {
    const sources = dataSourceService.getAllDataSources();
    
    const dataPromises = sources.map(source => 
      dataSourceService.fetchData(source.id).toPromise()
    );
    
    const results = await Promise.all(dataPromises);
    
    // Merge and aggregate
    return this.mergeData(results);
  }
}
```

### Data Source Failover

```typescript
async function fetchWithFailover(primaryId: string, backupId: string) {
  try {
    return await fetchData(primaryId).toPromise();
  } catch (error) {
    console.warn('Primary source failed, trying backup');
    return await fetchData(backupId).toPromise();
  }
}
```

### Caching Strategy

```typescript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(dataSourceId: string) {
  const cached = cache.get(dataSourceId);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // Fetch fresh data
  return fetchData(dataSourceId);
}
```

---

## 🎯 Production Deployment

### Environment Variables

```bash
# Database URLs
DATABASE_URL=postgresql://user:pass@host:5432/db

# API Keys
SALESFORCE_CLIENT_ID=xxx
SALESFORCE_CLIENT_SECRET=xxx
HUBSPOT_API_KEY=xxx

# Cloud Credentials
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AZURE_CLIENT_ID=xxx
AZURE_CLIENT_SECRET=xxx
GCP_SERVICE_ACCOUNT_KEY=xxx

# Encryption
ENCRYPTION_KEY=your-256-bit-key
```

### Connection Pooling

```javascript
// PostgreSQL pool
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// MySQL pool
const mysqlPool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'user',
  password: 'pass'
});
```

### Error Handling

```typescript
try {
  const data = await fetchData(dataSourceId);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    // Handle connection refused
  } else if (error.code === 'ETIMEDOUT') {
    // Handle timeout
  } else {
    // Handle other errors
  }
}
```

---

## 📚 API Reference

### DataSourceService

#### Methods

**`getAllDataSources(): DataSource[]`**
Get all configured data sources.

**`getDataSourcesByType(type): DataSource[]`**
Get sources by type (e.g., all PostgreSQL sources).

**`getConnectedDataSources(): DataSource[]`**
Get only currently connected sources.

**`createDataSource(dataSource): DataSource`**
Create new data source configuration.

**`updateDataSource(id, updates): void`**
Update data source configuration.

**`deleteDataSource(id): boolean`**
Delete data source.

**`testConnection(dataSource): Observable<DataSourceTest>`**
Test connection to data source.

**`fetchData(dataSourceId, query?): Observable<any[]>`**
Fetch data from source.

**`syncDataSource(dataSourceId): Observable<boolean>`**
Sync data from source.

**`getTemplates(): DataSourceTemplate[]`**
Get available data source templates.

**`getStatistics(): object`**
Get statistics about configured sources.

---

## 🚨 Troubleshooting

### Connection Timeouts

```typescript
// Increase timeout
config: {
  timeout: 60 // seconds
}
```

### Authentication Errors

```bash
# Verify credentials
# Check API key validity
# Ensure OAuth tokens haven't expired
```

### Network Issues

```bash
# Check firewall rules
# Verify DNS resolution
# Test with curl/telnet
```

### Query Errors

```sql
-- Test query directly first
-- Verify table/collection names
-- Check permissions
```

---

## ✅ Features Summary

- ✅ **13 data source types** supported
- ✅ **Database connectors** - PostgreSQL, MySQL, MongoDB
- ✅ **Data warehouses** - Snowflake, BigQuery
- ✅ **API connectors** - REST, GraphQL
- ✅ **Cloud metrics** - AWS, Azure, GCP
- ✅ **SaaS integrations** - Salesforce, HubSpot, Google Analytics
- ✅ **Connection testing** - Validate before use
- ✅ **Data fetching** - Query and sync
- ✅ **Observable streams** - Reactive data flow
- ✅ **Error handling** - Comprehensive error management
- ✅ **Security** - Credential encryption
- ✅ **Production ready** - Scalable architecture

---

## 🎓 Next Steps

1. **Install dependencies**: `npm install --legacy-peer-deps`
2. **Start service**: `npm run start:datasources`
3. **Access UI**: http://localhost:4200/data-sources
4. **Add sources**: Configure your first connection
5. **Test**: Verify connection works
6. **Fetch data**: Pull metrics into dashboard
7. **Automate**: Set up scheduled syncs

---

**Status**: ✅ **FULLY IMPLEMENTED**

All 13 data source types ready to use! 🚀

