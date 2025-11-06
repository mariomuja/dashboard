import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ETLJob {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  schedule?: ETLSchedule;
  source: ETLSource;
  transformations: TransformationRule[];
  validations: ValidationRule[];
  destination: ETLDestination;
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastRun?: Date;
    nextRun?: Date;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
  };
  logs: ETLLog[];
}

export interface ETLSchedule {
  enabled: boolean;
  frequency: 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM for daily
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timezone?: string;
}

export interface ETLSource {
  type: 'data-source' | 'file' | 'api';
  dataSourceId?: string;
  fileUrl?: string;
  apiEndpoint?: string;
  query?: string;
}

export interface ETLDestination {
  type: 'dashboard' | 'data-source' | 'file';
  dataSourceId?: string;
  filePath?: string;
  targetTable?: string;
}

export interface TransformationRule {
  id: string;
  name: string;
  type: 'map' | 'filter' | 'aggregate' | 'join' | 'calculate' | 'rename' | 'custom';
  enabled: boolean;
  config: any;
  order: number;
}

export interface ValidationRule {
  id: string;
  name: string;
  type: 'required' | 'type' | 'range' | 'regex' | 'unique' | 'custom';
  field: string;
  config: any;
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
}

export interface ETLLog {
  id: string;
  jobId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  phase: 'extract' | 'transform' | 'validate' | 'load';
  message: string;
  details?: any;
  recordsProcessed?: number;
  recordsFailed?: number;
}

export interface ETLJobRun {
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

@Injectable({
  providedIn: 'root'
})
export class EtlPipelineService {
  private readonly STORAGE_KEY = 'etl_jobs';
  
  private jobsSubject: BehaviorSubject<ETLJob[]>;
  public jobs$: Observable<ETLJob[]>;
  
  private jobs: ETLJob[] = [];
  private runningJobs: Map<string, ETLJobRun> = new Map();

  constructor() {
    this.loadJobs();
    this.jobsSubject = new BehaviorSubject<ETLJob[]>(this.jobs);
    this.jobs$ = this.jobsSubject.asObservable();
  }

  /**
   * Create new ETL job
   */
  createJob(job: Omit<ETLJob, 'id' | 'metadata' | 'logs' | 'status'>): ETLJob {
    const newJob: ETLJob = {
      ...job,
      id: `etl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'idle',
      metadata: {
        createdAt: new Date(),
        createdBy: this.getCurrentUserId(),
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0
      },
      logs: []
    };

    this.jobs.push(newJob);
    this.saveJobs();
    this.jobsSubject.next(this.jobs);

    console.log(`Created ETL job: ${newJob.name}`);
    return newJob;
  }

  /**
   * Update ETL job
   */
  updateJob(jobId: string, updates: Partial<ETLJob>): void {
    const index = this.jobs.findIndex(j => j.id === jobId);
    if (index > -1) {
      this.jobs[index] = { ...this.jobs[index], ...updates };
      this.saveJobs();
      this.jobsSubject.next(this.jobs);
      console.log(`Updated ETL job: ${jobId}`);
    }
  }

  /**
   * Delete ETL job
   */
  deleteJob(jobId: string): boolean {
    const index = this.jobs.findIndex(j => j.id === jobId);
    if (index > -1) {
      const job = this.jobs[index];
      if (job.status === 'running') {
        console.error('Cannot delete running job');
        return false;
      }
      this.jobs.splice(index, 1);
      this.saveJobs();
      this.jobsSubject.next(this.jobs);
      console.log(`Deleted ETL job: ${job.name}`);
      return true;
    }
    return false;
  }

  /**
   * Run ETL job
   */
  async runJob(jobId: string): Promise<ETLJobRun> {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'running') {
      throw new Error('Job is already running');
    }

    const run: ETLJobRun = {
      id: `run-${Date.now()}`,
      jobId,
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

    this.runningJobs.set(jobId, run);
    this.updateJob(jobId, { status: 'running' });
    this.addLog(jobId, 'info', 'extract', `Starting ETL job: ${job.name}`);

    try {
      // EXTRACT
      const extractedData = await this.extract(job);
      run.recordsExtracted = extractedData.length;
      this.addLog(jobId, 'success', 'extract', `Extracted ${extractedData.length} records`);

      // TRANSFORM
      const transformedData = await this.transform(job, extractedData);
      run.recordsTransformed = transformedData.length;
      this.addLog(jobId, 'success', 'transform', `Transformed ${transformedData.length} records`);

      // VALIDATE
      const validationResult = await this.validate(job, transformedData);
      run.recordsValidated = validationResult.validRecords.length;
      run.errors = validationResult.errors.length;
      run.warnings = validationResult.warnings.length;
      
      if (validationResult.errors.length > 0) {
        this.addLog(jobId, 'error', 'validate', `Validation failed: ${validationResult.errors.length} errors`);
        throw new Error('Validation failed');
      }
      
      if (validationResult.warnings.length > 0) {
        this.addLog(jobId, 'warning', 'validate', `Validation warnings: ${validationResult.warnings.length}`);
      }
      
      this.addLog(jobId, 'success', 'validate', `Validated ${validationResult.validRecords.length} records`);

      // LOAD
      const loadedCount = await this.load(job, validationResult.validRecords);
      run.recordsLoaded = loadedCount;
      this.addLog(jobId, 'success', 'load', `Loaded ${loadedCount} records`);

      // Complete
      run.status = 'completed';
      run.completedAt = new Date();
      run.duration = run.completedAt.getTime() - run.startedAt.getTime();

      this.updateJob(jobId, {
        status: 'completed',
        metadata: {
          ...job.metadata,
          lastRun: new Date(),
          totalRuns: job.metadata.totalRuns + 1,
          successfulRuns: job.metadata.successfulRuns + 1
        }
      });

      this.addLog(jobId, 'success', 'load', `Job completed successfully in ${run.duration}ms`);

    } catch (error: any) {
      run.status = 'failed';
      run.completedAt = new Date();
      run.duration = run.completedAt.getTime() - run.startedAt.getTime();

      this.updateJob(jobId, {
        status: 'failed',
        metadata: {
          ...job.metadata,
          lastRun: new Date(),
          totalRuns: job.metadata.totalRuns + 1,
          failedRuns: job.metadata.failedRuns + 1
        }
      });

      this.addLog(jobId, 'error', 'load', `Job failed: ${error.message}`);
    } finally {
      this.runningJobs.delete(jobId);
    }

    return run;
  }

  /**
   * EXTRACT: Extract data from source
   */
  private async extract(job: ETLJob): Promise<any[]> {
    // Simulate extraction - in production, would use DataSourceService
    this.addLog(job.id, 'info', 'extract', `Extracting from ${job.source.type}...`);
    
    // Simulate data extraction
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
   * TRANSFORM: Apply transformation rules
   */
  private async transform(job: ETLJob, data: any[]): Promise<any[]> {
    this.addLog(job.id, 'info', 'transform', `Applying ${job.transformations.length} transformations...`);
    
    let transformedData = [...data];
    const enabledRules = job.transformations
      .filter(r => r.enabled)
      .sort((a, b) => a.order - b.order);

    for (const rule of enabledRules) {
      transformedData = this.applyTransformation(transformedData, rule);
      this.addLog(job.id, 'info', 'transform', `Applied transformation: ${rule.name}`);
    }

    return transformedData;
  }

  /**
   * Apply single transformation rule
   */
  private applyTransformation(data: any[], rule: TransformationRule): any[] {
    switch (rule.type) {
      case 'filter':
        return data.filter(row => this.evaluateFilter(row, rule.config));
      
      case 'map':
        return data.map(row => this.applyMapping(row, rule.config));
      
      case 'aggregate':
        return this.aggregateData(data, rule.config);
      
      case 'calculate':
        return data.map(row => ({
          ...row,
          [rule.config.targetField]: this.calculateField(row, rule.config)
        }));
      
      case 'rename':
        return data.map(row => this.renameFields(row, rule.config));
      
      case 'custom':
        return this.applyCustomTransform(data, rule.config.function);
      
      default:
        return data;
    }
  }

  /**
   * VALIDATE: Check data quality
   */
  private async validate(job: ETLJob, data: any[]): Promise<{
    validRecords: any[];
    invalidRecords: any[];
    errors: any[];
    warnings: any[];
  }> {
    this.addLog(job.id, 'info', 'validate', `Validating ${data.length} records...`);
    
    const validRecords: any[] = [];
    const invalidRecords: any[] = [];
    const errors: any[] = [];
    const warnings: any[] = [];

    const enabledRules = job.validations.filter(r => r.enabled);

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      let isValid = true;

      for (const rule of enabledRules) {
        const result = this.validateRecord(record, rule);
        
        if (!result.valid) {
          if (rule.severity === 'error') {
            isValid = false;
            errors.push({
              record: i,
              field: rule.field,
              rule: rule.name,
              message: result.message
            });
          } else if (rule.severity === 'warning') {
            warnings.push({
              record: i,
              field: rule.field,
              rule: rule.name,
              message: result.message
            });
          }
        }
      }

      if (isValid) {
        validRecords.push(record);
      } else {
        invalidRecords.push(record);
      }
    }

    return { validRecords, invalidRecords, errors, warnings };
  }

  /**
   * Validate single record
   */
  private validateRecord(record: any, rule: ValidationRule): { valid: boolean; message?: string } {
    const value = record[rule.field];

    switch (rule.type) {
      case 'required':
        if (value === null || value === undefined || value === '') {
          return { valid: false, message: `${rule.field} is required` };
        }
        break;

      case 'type':
        const expectedType = rule.config.expectedType;
        if (typeof value !== expectedType) {
          return { valid: false, message: `${rule.field} must be ${expectedType}` };
        }
        break;

      case 'range':
        if (value < rule.config.min || value > rule.config.max) {
          return { valid: false, message: `${rule.field} must be between ${rule.config.min} and ${rule.config.max}` };
        }
        break;

      case 'regex':
        const regex = new RegExp(rule.config.pattern);
        if (!regex.test(value)) {
          return { valid: false, message: `${rule.field} does not match required pattern` };
        }
        break;

      case 'unique':
        // Would check against existing records in production
        break;

      case 'custom':
        const result = this.evaluateCustomValidation(value, rule.config.function);
        if (!result) {
          return { valid: false, message: rule.config.message || 'Custom validation failed' };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * LOAD: Load data to destination
   */
  private async load(job: ETLJob, data: any[]): Promise<number> {
    this.addLog(job.id, 'info', 'load', `Loading ${data.length} records to ${job.destination.type}...`);
    
    // Simulate loading - in production, would use DataSourceService or file system
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data.length);
      }, 500);
    });
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ETLJob[] {
    return [...this.jobs];
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): ETLJob | undefined {
    return this.jobs.find(j => j.id === jobId);
  }

  /**
   * Get scheduled jobs
   */
  getScheduledJobs(): ETLJob[] {
    return this.jobs.filter(j => j.schedule?.enabled);
  }

  /**
   * Get job logs
   */
  getJobLogs(jobId: string, limit?: number): ETLLog[] {
    const job = this.getJob(jobId);
    if (!job) return [];
    
    const logs = [...job.logs].reverse();
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Add log entry
   */
  private addLog(jobId: string, level: ETLLog['level'], phase: ETLLog['phase'], message: string, details?: any): void {
    const job = this.getJob(jobId);
    if (!job) return;

    const log: ETLLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jobId,
      timestamp: new Date(),
      level,
      phase,
      message,
      details
    };

    job.logs.push(log);
    
    // Keep only last 1000 logs per job
    if (job.logs.length > 1000) {
      job.logs = job.logs.slice(-1000);
    }

    this.saveJobs();
    this.jobsSubject.next(this.jobs);

    console.log(`[ETL-${phase.toUpperCase()}] ${message}`);
  }

  /**
   * Get job statistics
   */
  getJobStatistics(jobId: string): {
    totalRuns: number;
    successRate: number;
    averageDuration: number;
    lastRunStatus: string;
  } {
    const job = this.getJob(jobId);
    if (!job) {
      return {
        totalRuns: 0,
        successRate: 0,
        averageDuration: 0,
        lastRunStatus: 'never'
      };
    }

    const successRate = job.metadata.totalRuns > 0
      ? (job.metadata.successfulRuns / job.metadata.totalRuns) * 100
      : 0;

    return {
      totalRuns: job.metadata.totalRuns,
      successRate: Math.round(successRate),
      averageDuration: 0, // Would calculate from run history
      lastRunStatus: job.status
    };
  }

  /**
   * Pause job
   */
  pauseJob(jobId: string): void {
    this.updateJob(jobId, { status: 'paused' });
  }

  /**
   * Resume job
   */
  resumeJob(jobId: string): void {
    this.updateJob(jobId, { status: 'idle' });
  }

  // Transformation helper methods
  private evaluateFilter(row: any, config: any): boolean {
    // Simple filter evaluation
    return true; // Implement based on config
  }

  private applyMapping(row: any, config: any): any {
    const mapped: any = {};
    for (const [sourceField, targetField] of Object.entries(config.mapping)) {
      mapped[targetField as string] = row[sourceField];
    }
    return mapped;
  }

  private aggregateData(data: any[], config: any): any[] {
    // Group by field and aggregate
    const grouped = new Map();
    
    data.forEach(row => {
      const key = row[config.groupBy];
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(row);
    });

    return Array.from(grouped.entries()).map(([key, rows]: [any, any[]]) => ({
      [config.groupBy]: key,
      count: rows.length,
      sum: rows.reduce((sum, row) => sum + (row[config.aggregateField] || 0), 0),
      avg: rows.reduce((sum, row) => sum + (row[config.aggregateField] || 0), 0) / rows.length
    }));
  }

  private calculateField(row: any, config: any): any {
    // Evaluate expression
    try {
      const func = new Function('row', `return ${config.expression}`);
      return func(row);
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }

  private renameFields(row: any, config: any): any {
    const renamed: any = {};
    for (const [oldName, newName] of Object.entries(config.mapping)) {
      renamed[newName as string] = row[oldName];
    }
    return renamed;
  }

  private applyCustomTransform(data: any[], transformFunction: string): any[] {
    try {
      const func = new Function('data', transformFunction);
      return func(data);
    } catch (error) {
      console.error('Custom transform error:', error);
      return data;
    }
  }

  private evaluateCustomValidation(value: any, validationFunction: string): boolean {
    try {
      const func = new Function('value', `return ${validationFunction}`);
      return func(value);
    } catch (error) {
      console.error('Custom validation error:', error);
      return false;
    }
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('current_user_id') || 'admin';
  }

  private saveJobs(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.jobs));
  }

  private loadJobs(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.jobs = parsed.map((j: any) => ({
        ...j,
        metadata: {
          ...j.metadata,
          createdAt: new Date(j.metadata.createdAt),
          lastRun: j.metadata.lastRun ? new Date(j.metadata.lastRun) : undefined,
          nextRun: j.metadata.nextRun ? new Date(j.metadata.nextRun) : undefined
        },
        logs: j.logs.map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp)
        }))
      }));
    }
  }
}

