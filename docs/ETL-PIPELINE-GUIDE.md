# ETL Pipeline Guide

## 🎯 Overview

Complete ETL (Extract, Transform, Load) pipeline for automated data processing with transformation engine, data quality validation, and scheduled sync.

---

## ✨ Features

### ✅ Extract
- 📥 **Multiple Sources** - Extract from any connected data source
- 🔄 **Scheduled Extraction** - Automatic data pulls
- 📊 **Query Support** - Custom SQL/NoSQL queries
- 🔌 **API Integration** - Pull from REST/GraphQL

### ✅ Transform
- 🔀 **Transformation Rules** - 6 transformation types
- 📝 **Data Mapping** - Field mapping and renaming
- 🧮 **Calculations** - Computed fields
- 🔍 **Filtering** - Conditional filtering
- 📊 **Aggregation** - Group and aggregate data
- 🎯 **Custom Functions** - JavaScript expressions

### ✅ Load
- 📤 **Multiple Destinations** - Load to dashboard or data sources
- 💾 **Batch Loading** - Efficient bulk inserts
- 🔄 **Upsert Support** - Update or insert
- 📁 **File Export** - Export to JSON/CSV

### ✅ Data Quality Validation
- ✅ **Required Fields** - Ensure data completeness
- 🔢 **Type Checking** - Validate data types
- 📏 **Range Validation** - Min/max value checks
- 🔤 **Regex Patterns** - Pattern matching
- 🎯 **Unique Constraints** - Duplicate detection
- ⚙️ **Custom Validators** - Custom validation logic

### ✅ Scheduled Sync
- ⏰ **Cron Jobs** - Automated execution
- 📅 **Flexible Schedules** - Hourly, daily, weekly, monthly
- 🌍 **Timezone Support** - Run in specific timezones
- ⏸️ **Pause/Resume** - Control job execution

---

## 🚀 Quick Start

### 1. Start ETL Service

```bash
npm run start:etl
```

Service runs on `http://localhost:3008`

### 2. Create ETL Job

```typescript
import { EtlPipelineService } from './services/etl-pipeline.service';

constructor(private etlService: EtlPipelineService) {}

createETLJob() {
  const job = this.etlService.createJob({
    name: 'Daily Sales Sync',
    description: 'Sync sales data from PostgreSQL to dashboard',
    source: {
      type: 'data-source',
      dataSourceId: 'postgres-prod-id',
      query: 'SELECT * FROM sales WHERE date >= CURRENT_DATE - 7'
    },
    transformations: [
      {
        id: 't1',
        name: 'Calculate Revenue',
        type: 'calculate',
        enabled: true,
        config: {
          targetField: 'revenue',
          expression: 'row.quantity * row.price'
        },
        order: 1
      },
      {
        id: 't2',
        name: 'Filter High Value',
        type: 'filter',
        enabled: true,
        config: {
          expression: 'row.revenue > 1000'
        },
        order: 2
      }
    ],
    validations: [
      {
        id: 'v1',
        name: 'Revenue Required',
        type: 'required',
        field: 'revenue',
        config: {},
        severity: 'error',
        enabled: true
      },
      {
        id: 'v2',
        name: 'Revenue Range',
        type: 'range',
        field: 'revenue',
        config: { min: 0, max: 1000000 },
        severity: 'warning',
        enabled: true
      }
    ],
    destination: {
      type: 'dashboard',
      targetTable: 'kpi_metrics'
    },
    schedule: {
      enabled: true,
      frequency: 'daily',
      time: '02:00',
      timezone: 'UTC'
    }
  });

  console.log('Created job:', job.id);
}
```

### 3. Run Job

```typescript
// Run manually
async runETL(jobId: string) {
  const run = await this.etlService.runJob(jobId);
  
  console.log(`Job ${run.status}`);
  console.log(`Extracted: ${run.recordsExtracted}`);
  console.log(`Transformed: ${run.recordsTransformed}`);
  console.log(`Validated: ${run.recordsValidated}`);
  console.log(`Loaded: ${run.recordsLoaded}`);
  console.log(`Errors: ${run.errors}`);
  console.log(`Duration: ${run.duration}ms`);
}
```

---

## 📚 Transformation Types

### 1. **Map** - Transform fields

```typescript
{
  type: 'map',
  name: 'Rename Fields',
  config: {
    mapping: {
      'old_name': 'new_name',
      'customer_id': 'customerId',
      'order_total': 'revenue'
    }
  }
}
```

### 2. **Filter** - Remove unwanted records

```typescript
{
  type: 'filter',
  name: 'High Value Only',
  config: {
    expression: 'row.revenue > 1000 && row.status === "completed"'
  }
}
```

### 3. **Calculate** - Computed fields

```typescript
{
  type: 'calculate',
  name: 'Calculate Profit',
  config: {
    targetField: 'profit',
    expression: 'row.revenue - row.cost'
  }
}
```

### 4. **Aggregate** - Group and summarize

```typescript
{
  type: 'aggregate',
  name: 'Group by Category',
  config: {
    groupBy: 'category',
    aggregateField: 'revenue',
    functions: ['sum', 'avg', 'count']
  }
}
```

### 5. **Rename** - Rename fields

```typescript
{
  type: 'rename',
  name: 'Standardize Names',
  config: {
    mapping: {
      'FirstName': 'first_name',
      'LastName': 'last_name'
    }
  }
}
```

### 6. **Custom** - JavaScript function

```typescript
{
  type: 'custom',
  name: 'Custom Logic',
  config: {
    function: `
      return data.map(row => ({
        ...row,
        fullName: row.firstName + ' ' + row.lastName,
        isVIP: row.totalSpent > 10000
      }));
    `
  }
}
```

---

## ✅ Validation Types

### 1. **Required** - Field must exist

```typescript
{
  type: 'required',
  field: 'email',
  severity: 'error'
}
```

### 2. **Type** - Check data type

```typescript
{
  type: 'type',
  field: 'age',
  config: { expectedType: 'number' },
  severity: 'error'
}
```

### 3. **Range** - Value bounds

```typescript
{
  type: 'range',
  field: 'price',
  config: { min: 0, max: 10000 },
  severity: 'warning'
}
```

### 4. **Regex** - Pattern matching

```typescript
{
  type: 'regex',
  field: 'email',
  config: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
  severity: 'error'
}
```

### 5. **Unique** - No duplicates

```typescript
{
  type: 'unique',
  field: 'customerId',
  config: {},
  severity: 'error'
}
```

### 6. **Custom** - Custom validation

```typescript
{
  type: 'custom',
  field: 'status',
  config: {
    function: `value === 'active' || value === 'inactive'`,
    message: 'Status must be active or inactive'
  },
  severity: 'error'
}
```

---

## 📅 Scheduling

### Frequency Options

**Hourly:**
```typescript
schedule: {
  enabled: true,
  frequency: 'hourly',
  time: '00:15' // Run at 15 minutes past each hour
}
```

**Daily:**
```typescript
schedule: {
  enabled: true,
  frequency: 'daily',
  time: '02:00' // Run at 2 AM every day
}
```

**Weekly:**
```typescript
schedule: {
  enabled: true,
  frequency: 'weekly',
  time: '08:00',
  dayOfWeek: 1 // Monday (0=Sunday, 1=Monday, etc.)
}
```

**Monthly:**
```typescript
schedule: {
  enabled: true,
  frequency: 'monthly',
  time: '00:00',
  dayOfMonth: 1 // 1st of each month
}
```

---

## 🔍 Data Quality Example

### Complete Validation Suite

```typescript
validations: [
  // Required fields
  {
    type: 'required',
    field: 'customerId',
    severity: 'error'
  },
  {
    type: 'required',
    field: 'email',
    severity: 'error'
  },
  
  // Type checking
  {
    type: 'type',
    field: 'revenue',
    config: { expectedType: 'number' },
    severity: 'error'
  },
  
  // Range validation
  {
    type: 'range',
    field: 'revenue',
    config: { min: 0, max: 1000000 },
    severity: 'warning'
  },
  
  // Pattern matching
  {
    type: 'regex',
    field: 'email',
    config: { pattern: '^[^@]+@[^@]+\\.[^@]+$' },
    severity: 'error'
  },
  
  // Custom validation
  {
    type: 'custom',
    field: 'status',
    config: {
      function: `['pending', 'completed', 'cancelled'].includes(value)`,
      message: 'Invalid status'
    },
    severity: 'error'
  }
]
```

---

## 📊 Job Monitoring

### Job Run Information

```typescript
interface ETLJobRun {
  id: string;
  jobId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  recordsExtracted: number;
  recordsTransformed: number;
  recordsValidated: number;
  recordsLoaded: number;
  errors: number;
  warnings: number;
  logs: ETLLog[];
}
```

### View Job Logs

```typescript
// Get recent logs
const logs = etlService.getJobLogs('job-id', 100);

logs.forEach(log => {
  console.log(`[${log.level.toUpperCase()}] [${log.phase}] ${log.message}`);
});

// Example output:
// [INFO] [extract] Starting extraction...
// [SUCCESS] [extract] Extracted 1,247 records
// [INFO] [transform] Applying 3 transformations...
// [SUCCESS] [transform] Transformed 1,247 records
// [INFO] [validate] Validating 1,247 records...
// [WARNING] [validate] 12 validation warnings
// [SUCCESS] [validate] Validated 1,235 records
// [INFO] [load] Loading 1,235 records...
// [SUCCESS] [load] Loaded 1,235 records
// [SUCCESS] [load] Job completed in 1,543ms
```

### Job Statistics

```typescript
const stats = etlService.getJobStatistics('job-id');

console.log(`Total Runs: ${stats.totalRuns}`);
console.log(`Success Rate: ${stats.successRate}%`);
console.log(`Last Status: ${stats.lastRunStatus}`);
```

---

## 🔄 ETL Workflow

### Complete ETL Pipeline

```
┌──────────────┐
│   EXTRACT    │
│              │
│ Data Sources │
│ APIs, Files  │
│ Databases    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  TRANSFORM   │
│              │
│ Map, Filter  │
│ Calculate    │
│ Aggregate    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   VALIDATE   │
│              │
│ Type Check   │
│ Range Check  │
│ Required     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     LOAD     │
│              │
│  Dashboard   │
│  Database    │
│    File      │
└──────────────┘
```

---

## 💡 Use Cases

### 1. **Daily Sales Aggregation**

```typescript
{
  name: 'Daily Sales Summary',
  source: {
    type: 'data-source',
    dataSourceId: 'salesforce-id',
    query: 'SELECT * FROM Opportunities WHERE CloseDate = TODAY'
  },
  transformations: [
    {
      type: 'filter',
      config: { expression: 'row.Stage === "Closed Won"' }
    },
    {
      type: 'aggregate',
      config: {
        groupBy: 'Region',
        aggregateField: 'Amount',
        functions: ['sum', 'avg', 'count']
      }
    }
  ],
  validations: [
    { type: 'required', field: 'Region' },
    { type: 'range', field: 'Amount', config: { min: 0 } }
  ],
  destination: {
    type: 'dashboard'
  },
  schedule: {
    enabled: true,
    frequency: 'daily',
    time: '06:00'
  }
}
```

### 2. **Real-time Data Cleansing**

```typescript
{
  name: 'Customer Data Cleansing',
  source: {
    type: 'data-source',
    dataSourceId: 'mongodb-id'
  },
  transformations: [
    {
      type: 'map',
      name: 'Standardize Names',
      config: {
        mapping: {
          'firstName': 'first_name',
          'lastName': 'last_name'
        }
      }
    },
    {
      type: 'calculate',
      name: 'Full Name',
      config: {
        targetField: 'full_name',
        expression: 'row.first_name + " " + row.last_name'
      }
    }
  ],
  validations: [
    {
      type: 'required',
      field: 'email'
    },
    {
      type: 'regex',
      field: 'email',
      config: { pattern: '^[^@]+@[^@]+$' }
    }
  ],
  destination: {
    type: 'data-source',
    dataSourceId: 'cleaned-data-id'
  }
}
```

### 3. **Multi-Source Data Integration**

```typescript
{
  name: 'Unified Customer View',
  source: {
    type: 'data-source',
    dataSourceId: 'multiple-sources' // Could extract from multiple
  },
  transformations: [
    {
      type: 'join',
      name: 'Join Customer Data',
      config: {
        leftKey: 'customerId',
        rightSource: 'crm-data',
        rightKey: 'id'
      }
    },
    {
      type: 'aggregate',
      name: 'Calculate Lifetime Value',
      config: {
        groupBy: 'customerId',
        aggregateField: 'orderValue',
        functions: ['sum']
      }
    }
  ],
  validations: [
    { type: 'unique', field: 'customerId' }
  ],
  destination: {
    type: 'data-source',
    dataSourceId: 'customer-360-id'
  },
  schedule: {
    enabled: true,
    frequency: 'hourly',
    time: '00:00'
  }
}
```

---

## 🔧 API Reference

### ETL Service Methods

#### Job Management

**`createJob(job): ETLJob`**
Create new ETL job.

**`updateJob(jobId, updates): void`**
Update job configuration.

**`deleteJob(jobId): boolean`**
Delete job (not allowed if running).

**`getAllJobs(): ETLJob[]`**
Get all ETL jobs.

**`getJob(jobId): ETLJob | undefined`**
Get specific job.

**`getScheduledJobs(): ETLJob[]`**
Get jobs with scheduling enabled.

#### Execution

**`runJob(jobId): Promise<ETLJobRun>`**
Execute ETL job.

**`pauseJob(jobId): void`**
Pause job execution.

**`resumeJob(jobId): void`**
Resume paused job.

#### Monitoring

**`getJobLogs(jobId, limit?): ETLLog[]`**
Get job execution logs.

**`getJobStatistics(jobId): object`**
Get job performance statistics.

---

## 🎨 Backend API Endpoints

### Jobs

```
POST   /api/etl/jobs           - Create job
GET    /api/etl/jobs           - List jobs
GET    /api/etl/jobs/:id       - Get job
PUT    /api/etl/jobs/:id       - Update job
DELETE /api/etl/jobs/:id       - Delete job
POST   /api/etl/jobs/:id/run   - Run job
GET    /api/etl/jobs/:id/runs  - Get run history
GET    /api/etl/stats          - Get statistics
GET    /api/health             - Health check
```

### Create Job Example

**Request:**
```json
POST /api/etl/jobs
{
  "name": "Daily Sales Sync",
  "description": "Sync sales from DB",
  "source": {
    "type": "data-source",
    "dataSourceId": "postgres-1"
  },
  "transformations": [
    {
      "type": "filter",
      "enabled": true,
      "config": { "minValue": 100 }
    }
  ],
  "validations": [
    {
      "type": "required",
      "field": "amount",
      "severity": "error"
    }
  ],
  "destination": {
    "type": "dashboard"
  },
  "schedule": {
    "enabled": true,
    "frequency": "daily",
    "time": "02:00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "ETL job created",
  "job": {
    "id": "etl-1234567890",
    "name": "Daily Sales Sync",
    "status": "idle",
    ...
  }
}
```

---

## 📈 Performance Tips

### 1. **Batch Processing**

```typescript
// Process in batches of 1000
transformations: [
  {
    type: 'custom',
    config: {
      function: `
        const batchSize = 1000;
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
          batches.push(data.slice(i, i + batchSize));
        }
        return batches.flatMap(batch => processBatch(batch));
      `
    }
  }
]
```

### 2. **Incremental Extraction**

```typescript
source: {
  type: 'data-source',
  dataSourceId: 'postgres-id',
  query: `
    SELECT * FROM sales 
    WHERE updated_at > $lastSync
    ORDER BY updated_at ASC
  `
}
```

### 3. **Parallel Processing**

```typescript
// Split large datasets
transformations: [
  {
    type: 'custom',
    config: {
      function: `
        const chunks = chunkArray(data, 100);
        return Promise.all(chunks.map(chunk => processChunk(chunk)));
      `
    }
  }
]
```

---

## 🔒 Security & Best Practices

### 1. **Secure Credentials**

```typescript
// Never log credentials
console.log({ ...job, credentials: '[REDACTED]' });

// Encrypt in transit
const encrypted = encryptCredentials(job.source.credentials);
```

### 2. **Error Handling**

```typescript
try {
  await etlService.runJob(jobId);
} catch (error) {
  console.error('ETL failed:', error);
  notifyAdmin(error);
  rollbackChanges();
}
```

### 3. **Data Validation**

```typescript
// Always validate before loading
validations: [
  { type: 'required', field: 'id', severity: 'error' },
  { type: 'type', field: 'amount', config: { expectedType: 'number' } },
  { type: 'range', field: 'amount', config: { min: 0 } }
]
```

### 4. **Audit Trail**

```typescript
// All ETL operations are logged
const logs = etlService.getJobLogs(jobId);

// Review for compliance
logs.filter(l => l.level === 'error').forEach(log => {
  auditTrail.log('etl.error', 'etl', jobId, log);
});
```

---

## 📊 Monitoring Dashboard

### Job Statistics

```typescript
const stats = {
  totalJobs: 45,
  scheduledJobs: 23,
  runningJobs: 3,
  totalRuns: 1,247,
  successfulRuns: 1,198,
  failedRuns: 49,
  successRate: 96.1 // %
};
```

### Recent Runs

```typescript
const recentRuns = [
  {
    job: 'Daily Sales Sync',
    status: 'completed',
    duration: 1543, // ms
    records: 1235,
    timestamp: '2024-11-03 02:00:15'
  },
  {
    job: 'Hourly Customer Sync',
    status: 'completed',
    duration: 845,
    records: 47,
    timestamp: '2024-11-03 15:00:05'
  }
];
```

---

## ✅ Features Summary

- ✅ **Extract** - From any data source
- ✅ **Transform** - 6 transformation types
- ✅ **Load** - To multiple destinations
- ✅ **Validate** - 6 validation types
- ✅ **Schedule** - Cron-based automation
- ✅ **Logs** - Complete audit trail
- ✅ **Statistics** - Performance tracking
- ✅ **Error Handling** - Robust error management
- ✅ **Batch Processing** - Handle large datasets
- ✅ **Parallel Execution** - Multiple jobs
- ✅ **Job Queue** - Ordered execution
- ✅ **Monitoring** - Real-time status

---

## 🚀 Production Deployment

### Environment Variables

```bash
ETL_PORT=3008
ETL_BATCH_SIZE=1000
ETL_MAX_RETRIES=3
ETL_TIMEOUT=300000
```

### Start Service

```bash
# Development
npm run start:etl

# Production
NODE_ENV=production node server-etl.js
```

### Scale Horizontally

```javascript
// Use job queue (Redis/RabbitMQ)
const queue = new JobQueue('etl-jobs');

app.post('/api/etl/jobs/:id/run', async (req, res) => {
  await queue.add(req.params.id);
  res.json({ queued: true });
});

// Worker processes
queue.process(async (job) => {
  return await executeETLJob(job.data);
});
```

---

## ✅ Complete Implementation

All ETL features are **fully implemented**:

- ✅ Extract from data sources
- ✅ Transform with 6 rule types
- ✅ Validate with 6 validation types
- ✅ Load to destinations
- ✅ Scheduled sync with cron
- ✅ Job monitoring and logs
- ✅ Statistics and analytics
- ✅ Frontend service
- ✅ Backend service
- ✅ Complete documentation

---

**Ready for Enterprise ETL workflows!** 🚀

