const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const PORT = process.env.ETL_PORT || 3008;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for ETL jobs and runs
let etlJobs = [];
let etlRuns = [];
let cronJobs = new Map();

/**
 * Create ETL job
 */
app.post('/api/etl/jobs', (req, res) => {
  try {
    const { name, description, source, transformations, validations, destination, schedule } = req.body;

    const job = {
      id: `etl-${Date.now()}`,
      name,
      description,
      source,
      transformations: transformations || [],
      validations: validations || [],
      destination,
      schedule: schedule || { enabled: false, frequency: 'manual' },
      status: 'idle',
      metadata: {
        createdAt: new Date(),
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0
      }
    };

    etlJobs.push(job);

    // Set up cron job if scheduled
    if (schedule?.enabled) {
      setupCronJob(job);
    }

    res.json({
      success: true,
      message: 'ETL job created',
      job: sanitizeJob(job)
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all ETL jobs
 */
app.get('/api/etl/jobs', (req, res) => {
  res.json({
    jobs: etlJobs.map(sanitizeJob)
  });
});

/**
 * Get job by ID
 */
app.get('/api/etl/jobs/:id', (req, res) => {
  const job = etlJobs.find(j => j.id === req.params.id);
  
  if (job) {
    res.json({ job: sanitizeJob(job) });
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

/**
 * Update ETL job
 */
app.put('/api/etl/jobs/:id', (req, res) => {
  try {
    const index = etlJobs.findIndex(j => j.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = etlJobs[index];
    const updates = req.body;

    // Update job
    etlJobs[index] = { ...job, ...updates };

    // Update cron job if schedule changed
    if (updates.schedule) {
      if (cronJobs.has(job.id)) {
        cronJobs.get(job.id).stop();
        cronJobs.delete(job.id);
      }
      
      if (updates.schedule.enabled) {
        setupCronJob(etlJobs[index]);
      }
    }

    res.json({
      success: true,
      message: 'Job updated',
      job: sanitizeJob(etlJobs[index])
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete ETL job
 */
app.delete('/api/etl/jobs/:id', (req, res) => {
  const index = etlJobs.findIndex(j => j.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const job = etlJobs[index];

  // Stop cron job if exists
  if (cronJobs.has(job.id)) {
    cronJobs.get(job.id).stop();
    cronJobs.delete(job.id);
  }

  etlJobs.splice(index, 1);

  res.json({
    success: true,
    message: 'Job deleted'
  });
});

/**
 * Run ETL job
 */
app.post('/api/etl/jobs/:id/run', async (req, res) => {
  try {
    const job = etlJobs.find(j => j.id === req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'running') {
      return res.status(400).json({ error: 'Job is already running' });
    }

    const run = await executeETLJob(job);

    res.json({
      success: run.status === 'completed',
      message: run.status === 'completed' ? 'Job completed successfully' : 'Job failed',
      run
    });
  } catch (error) {
    console.error('Run job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get job runs history
 */
app.get('/api/etl/jobs/:id/runs', (req, res) => {
  const jobRuns = etlRuns.filter(r => r.jobId === req.params.id);
  res.json({
    runs: jobRuns.slice(-50).reverse() // Last 50, newest first
  });
});

/**
 * Get ETL statistics
 */
app.get('/api/etl/stats', (req, res) => {
  const stats = {
    totalJobs: etlJobs.length,
    scheduledJobs: etlJobs.filter(j => j.schedule?.enabled).length,
    runningJobs: etlJobs.filter(j => j.status === 'running').length,
    totalRuns: etlRuns.length,
    successfulRuns: etlRuns.filter(r => r.status === 'completed').length,
    failedRuns: etlRuns.filter(r => r.status === 'failed').length
  };

  res.json(stats);
});

/**
 * Execute ETL job
 */
async function executeETLJob(job) {
  console.log(`Executing ETL job: ${job.name}`);

  const run = {
    id: `run-${Date.now()}`,
    jobId: job.id,
    status: 'running',
    startedAt: new Date(),
    recordsExtracted: 0,
    recordsTransformed: 0,
    recordsValidated: 0,
    recordsLoaded: 0,
    errors: 0,
    warnings: 0,
    logs: []
  };

  etlRuns.push(run);

  // Update job status
  const jobIndex = etlJobs.findIndex(j => j.id === job.id);
  if (jobIndex > -1) {
    etlJobs[jobIndex].status = 'running';
  }

  try {
    // EXTRACT
    addRunLog(run, 'info', 'extract', 'Starting extraction...');
    const extractedData = await extractData(job.source);
    run.recordsExtracted = extractedData.length;
    addRunLog(run, 'success', 'extract', `Extracted ${extractedData.length} records`);

    // TRANSFORM
    addRunLog(run, 'info', 'transform', 'Starting transformation...');
    const transformedData = applyTransformations(extractedData, job.transformations);
    run.recordsTransformed = transformedData.length;
    addRunLog(run, 'success', 'transform', `Transformed ${transformedData.length} records`);

    // VALIDATE
    addRunLog(run, 'info', 'validate', 'Starting validation...');
    const validationResult = validateData(transformedData, job.validations);
    run.recordsValidated = validationResult.validRecords.length;
    run.errors = validationResult.errors.length;
    run.warnings = validationResult.warnings.length;

    if (validationResult.errors.length > 0) {
      addRunLog(run, 'error', 'validate', `Validation failed: ${validationResult.errors.length} errors`);
      throw new Error('Validation failed');
    }

    addRunLog(run, 'success', 'validate', `Validated ${validationResult.validRecords.length} records`);

    // LOAD
    addRunLog(run, 'info', 'load', 'Starting load...');
    const loadedCount = await loadData(job.destination, validationResult.validRecords);
    run.recordsLoaded = loadedCount;
    addRunLog(run, 'success', 'load', `Loaded ${loadedCount} records`);

    // Complete
    run.status = 'completed';
    run.completedAt = new Date();
    run.duration = run.completedAt - run.startedAt;

    if (jobIndex > -1) {
      etlJobs[jobIndex].status = 'completed';
      etlJobs[jobIndex].metadata.lastRun = new Date();
      etlJobs[jobIndex].metadata.totalRuns++;
      etlJobs[jobIndex].metadata.successfulRuns++;
    }

    addRunLog(run, 'success', 'load', `Job completed in ${run.duration}ms`);

  } catch (error) {
    run.status = 'failed';
    run.completedAt = new Date();
    run.duration = run.completedAt - run.startedAt;

    if (jobIndex > -1) {
      etlJobs[jobIndex].status = 'failed';
      etlJobs[jobIndex].metadata.lastRun = new Date();
      etlJobs[jobIndex].metadata.totalRuns++;
      etlJobs[jobIndex].metadata.failedRuns++;
    }

    addRunLog(run, 'error', 'load', `Job failed: ${error.message}`);
  }

  return run;
}

/**
 * Extract data from source
 */
async function extractData(source) {
  // Simulate extraction
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Record ${i + 1}`,
        value: Math.random() * 1000,
        date: new Date()
      }));
      resolve(mockData);
    }, 500);
  });
}

/**
 * Apply transformations
 */
function applyTransformations(data, rules) {
  let transformed = data;
  const enabled = rules.filter(r => r.enabled).sort((a, b) => a.order - b.order);
  
  enabled.forEach(rule => {
    transformed = applyTransformation(transformed, rule);
  });
  
  return transformed;
}

/**
 * Apply single transformation
 */
function applyTransformation(data, rule) {
  switch (rule.type) {
    case 'filter':
      return data.filter(row => row.value > (rule.config.minValue || 0));
    case 'map':
      return data.map(row => ({ ...row, transformed: true }));
    default:
      return data;
  }
}

/**
 * Validate data
 */
function validateData(data, rules) {
  const validRecords = [];
  const invalidRecords = [];
  const errors = [];
  const warnings = [];

  data.forEach((record, index) => {
    let isValid = true;

    rules.filter(r => r.enabled).forEach(rule => {
      const value = record[rule.field];
      
      if (rule.type === 'required' && !value) {
        errors.push({ record: index, field: rule.field, message: 'Required field missing' });
        isValid = false;
      }
    });

    if (isValid) {
      validRecords.push(record);
    } else {
      invalidRecords.push(record);
    }
  });

  return { validRecords, invalidRecords, errors, warnings };
}

/**
 * Load data to destination
 */
async function loadData(destination, data) {
  // Simulate loading
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.length);
    }, 500);
  });
}

/**
 * Add log to run
 */
function addRunLog(run, level, phase, message) {
  run.logs.push({
    timestamp: new Date(),
    level,
    phase,
    message
  });
}

/**
 * Setup cron job for scheduled ETL
 */
function setupCronJob(job) {
  const cronExpression = getCronExpression(job.schedule);
  
  if (!cronExpression) {
    console.warn(`Invalid schedule for job ${job.id}`);
    return;
  }

  const cronJob = cron.schedule(cronExpression, async () => {
    console.log(`Running scheduled ETL job: ${job.name}`);
    try {
      await executeETLJob(job);
    } catch (error) {
      console.error(`Scheduled job failed: ${job.name}`, error);
    }
  });

  cronJobs.set(job.id, cronJob);
  console.log(`Scheduled ETL job: ${job.name} with cron: ${cronExpression}`);
}

/**
 * Convert schedule to cron expression
 */
function getCronExpression(schedule) {
  if (!schedule || !schedule.enabled) return null;

  const time = schedule.time || '00:00';
  const [hours, minutes] = time.split(':');

  switch (schedule.frequency) {
    case 'hourly':
      return `${minutes} * * * *`;
    case 'daily':
      return `${minutes} ${hours} * * *`;
    case 'weekly':
      const day = schedule.dayOfWeek || 1; // Default Monday
      return `${minutes} ${hours} * * ${day}`;
    case 'monthly':
      const dayOfMonth = schedule.dayOfMonth || 1;
      return `${minutes} ${hours} ${dayOfMonth} * *`;
    default:
      return null;
  }
}

/**
 * Sanitize job (remove sensitive data)
 */
function sanitizeJob(job) {
  return {
    ...job,
    source: {
      ...job.source,
      credentials: undefined // Don't send credentials to frontend
    }
  };
}

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ETL Pipeline Service',
    activeJobs: etlJobs.length,
    scheduledJobs: Array.from(cronJobs.keys()).length,
    totalRuns: etlRuns.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ETL Pipeline service running on http://localhost:${PORT}`);
  console.log('Features:');
  console.log('  - Extract from multiple sources');
  console.log('  - Transform with rules engine');
  console.log('  - Validate data quality');
  console.log('  - Load to destinations');
  console.log('  - Scheduled sync with cron');
});

