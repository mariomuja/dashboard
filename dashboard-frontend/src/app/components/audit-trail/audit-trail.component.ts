import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuditTrailService, AuditEntry } from '../../services/audit-trail.service';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.css']
})
export class AuditTrailComponent implements OnInit {
  entries: AuditEntry[] = [];
  filteredEntries: AuditEntry[] = [];
  
  // Filters
  filterAction = '';
  filterUser = '';
  filterStatus: 'all' | 'success' | 'failure' | 'pending' = 'all';
  filterStartDate = '';
  filterEndDate = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 50;
  
  // Statistics
  statistics: any = null;
  securityEvents: AuditEntry[] = [];
  
  constructor(
    private auditService: AuditTrailService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEntries();
    this.loadStatistics();
    this.loadSecurityEvents();
  }

  loadEntries(): void {
    this.entries = this.auditService.getEntries({});
    this.applyFilters();
  }

  loadStatistics(): void {
    this.statistics = this.auditService.getStatistics();
  }

  loadSecurityEvents(): void {
    this.securityEvents = this.auditService.getSecurityEvents();
  }

  applyFilters(): void {
    let filtered = [...this.entries];

    // Filter by action
    if (this.filterAction) {
      filtered = filtered.filter(e => 
        e.action.toLowerCase().includes(this.filterAction.toLowerCase())
      );
    }

    // Filter by user
    if (this.filterUser) {
      filtered = filtered.filter(e => 
        e.userId.toLowerCase().includes(this.filterUser.toLowerCase())
      );
    }

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === this.filterStatus);
    }

    // Filter by date range
    if (this.filterStartDate) {
      const startDate = new Date(this.filterStartDate);
      filtered = filtered.filter(e => new Date(e.timestamp) >= startDate);
    }

    if (this.filterEndDate) {
      const endDate = new Date(this.filterEndDate);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(e => new Date(e.timestamp) <= endDate);
    }

    this.filteredEntries = filtered;
  }

  get paginatedEntries(): AuditEntry[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredEntries.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEntries.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  clearFilters(): void {
    this.filterAction = '';
    this.filterUser = '';
    this.filterStatus = 'all';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.applyFilters();
  }

  exportToCSV(): void {
    this.auditService.exportToCSV();
    alert('Audit trail exported to audit-trail-export.csv');
  }

  getActionIcon(action: string): string {
    if (action.includes('login')) return '🔐';
    if (action.includes('create')) return '➕';
    if (action.includes('update')) return '✏️';
    if (action.includes('delete')) return '🗑️';
    if (action.includes('export')) return '📤';
    if (action.includes('import')) return '📥';
    if (action.includes('view')) return '👁️';
    return '📝';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return '✅';
      case 'failure': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success': return '#10b981';
      case 'failure': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
