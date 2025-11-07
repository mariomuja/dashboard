import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EtlPipelineService, ETLJob, ETLLog } from '../../services/etl-pipeline.service';

@Component({
  selector: 'app-etl-jobs',
  templateUrl: './etl-jobs.component.html',
  styleUrls: ['./etl-jobs.component.css']
})
export class EtlJobsComponent implements OnInit {
  jobs: ETLJob[] = [];
  selectedJob: ETLJob | null = null;
  showLogs = false;
  logs: ETLLog[] = [];
  
  constructor(
    private etlService: EtlPipelineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobs = this.etlService.getAllJobs();
  }

  get scheduledJobs(): ETLJob[] {
    return this.etlService.getScheduledJobs();
  }

  get runningJobs(): ETLJob[] {
    return this.jobs.filter(j => j.status === 'running');
  }

  selectJob(job: ETLJob): void {
    this.selectedJob = job;
    this.loadLogs(job.id);
  }

  loadLogs(jobId: string): void {
    this.logs = this.etlService.getJobLogs(jobId, 50);
    this.showLogs = true;
  }

  async runJob(job: ETLJob): Promise<void> {
    if (!confirm(`Run ETL job "${job.name}"?`)) {
      return;
    }

    try {
      const run = await this.etlService.runJob(job.id);
      this.loadJobs();
      this.loadLogs(job.id);
      
      if (run.status === 'completed') {
        alert(`Job completed successfully!\n\nExtracted: ${run.recordsExtracted}\nTransformed: ${run.recordsTransformed}\nValidated: ${run.recordsValidated}\nLoaded: ${run.recordsLoaded}\nDuration: ${run.duration}ms`);
      } else {
        alert(`Job failed!\n\nErrors: ${run.errors}\nCheck logs for details.`);
      }
    } catch (error: any) {
      alert(`Failed to run job: ${error.message}`);
    }
  }

  pauseJob(job: ETLJob): void {
    this.etlService.pauseJob(job.id);
    this.loadJobs();
    alert(`Job "${job.name}" paused`);
  }

  resumeJob(job: ETLJob): void {
    this.etlService.resumeJob(job.id);
    this.loadJobs();
    alert(`Job "${job.name}" resumed`);
  }

  viewStatistics(job: ETLJob): void {
    const stats = this.etlService.getJobStatistics(job.id);
    alert(`Statistics for "${job.name}":\n\nTotal Runs: ${stats.totalRuns}\nSuccess Rate: ${stats.successRate}%\nLast Status: ${stats.lastRunStatus}`);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'idle': return '⭕';
      case 'running': return '⏳';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'paused': return '⏸️';
      default: return '❓';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'idle': return '#6b7280';
      case 'running': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'paused': return '#3b82f6';
      default: return '#9ca3af';
    }
  }

  getLogIcon(level: string): string {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  }

  getLogColor(level: string): string {
    switch (level) {
      case 'info': return '#3b82f6';
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  }

  formatDate(date: Date | undefined): string {
    return date ? new Date(date).toLocaleString() : 'Never';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

