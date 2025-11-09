import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  tenantId: string;
  userId: string;
  username: string;
  action: AuditAction;
  resource: {
    type: string;
    id: string;
  };
  details: any;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  changes?: {
    before: any;
    after: any;
  };
}

export type AuditAction =
  // Authentication
  | 'user.login'
  | 'user.logout'
  | 'user.login.failed'
  | 'user.mfa.enabled'
  | 'user.mfa.disabled'
  | 'user.password.changed'
  // User Management
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.suspended'
  | 'user.activated'
  | 'user.role.changed'
  // Data Access
  | 'data.viewed'
  | 'data.exported'
  | 'data.downloaded'
  | 'data.uploaded'
  // Dashboard
  | 'dashboard.viewed'
  | 'dashboard.created'
  | 'dashboard.updated'
  | 'dashboard.deleted'
  | 'dashboard.shared'
  // Reports
  | 'report.generated'
  | 'report.scheduled'
  | 'report.sent'
  // Settings
  | 'settings.updated'
  | 'branding.updated'
  | 'organization.created'
  | 'organization.updated'
  | 'organization.deleted'
  // Tenant
  | 'tenant.created'
  | 'tenant.switched'
  | 'tenant.settings.updated'
  // Security
  | 'security.breach.detected'
  | 'access.denied'
  | 'permission.changed';

export interface AuditFilter {
  tenantId?: string;
  userId?: string;
  action?: AuditAction;
  resource?: string;
  status?: 'success' | 'failure' | 'warning';
  startDate?: Date;
  endDate?: Date;
}

export interface AuditStatistics {
  totalEntries: number;
  successCount: number;
  failureCount: number;
  warningCount: number;
  successRate: number;
  uniqueUsers: number;
  topActions: { action: string; count: number }[];
  topUsers: { userId: string; username: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditTrailService {
  private readonly AUDIT_KEY = 'audit_trail';
  private readonly MAX_ENTRIES = 10000; // Keep last 10k entries in memory
  
  private entries: AuditEntry[] = [];
  private entriesSubject: BehaviorSubject<AuditEntry[]>;
  public entries$: Observable<AuditEntry[]>;

  constructor() {
    this.loadEntries();
    this.entriesSubject = new BehaviorSubject<AuditEntry[]>(this.entries);
    this.entries$ = this.entriesSubject.asObservable();
  }

  /**
   * Log an audit entry
   */
  log(
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    details: any = {},
    status: 'success' | 'failure' | 'warning' = 'success',
    changes?: { before: any; after: any }
  ): void {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      tenantId: this.getCurrentTenantId(),
      userId: this.getCurrentUserId(),
      username: this.getCurrentUsername(),
      action,
      resource: {
        type: resourceType,
        id: resourceId
      },
      details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      status,
      changes
    };

    this.entries.unshift(entry); // Add to beginning
    
    // Keep only last MAX_ENTRIES
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(0, this.MAX_ENTRIES);
    }

    this.saveEntries();
    this.entriesSubject.next(this.entries);

    console.log(`[AUDIT] ${action} on ${resourceType}/${resourceId} by ${entry.username} - ${status}`);
  }

  /**
   * Get all audit entries with optional filtering
   */
  getEntries(filter?: AuditFilter, limit?: number): AuditEntry[] {
    let filtered = [...this.entries];

    if (filter) {
      if (filter.tenantId) {
        filtered = filtered.filter(e => e.tenantId === filter.tenantId);
      }
      if (filter.userId) {
        filtered = filtered.filter(e => e.userId === filter.userId);
      }
      if (filter.action) {
        filtered = filtered.filter(e => e.action === filter.action);
      }
      if (filter.resource) {
        filtered = filtered.filter(e => e.resource.type === filter.resource || e.resource.id === filter.resource);
      }
      if (filter.status) {
        filtered = filtered.filter(e => e.status === filter.status);
      }
      if (filter.startDate) {
        filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
      }
      if (filter.endDate) {
        filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
      }
    }

    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }

  /**
   * Get statistics for audit entries
   */
  getStatistics(filter?: AuditFilter): AuditStatistics {
    const entries = this.getEntries(filter);

    const successCount = entries.filter(e => e.status === 'success').length;
    const failureCount = entries.filter(e => e.status === 'failure').length;
    const warningCount = entries.filter(e => e.status === 'warning').length;

    const uniqueUserIds = new Set(entries.map(e => e.userId));
    const uniqueUsers = uniqueUserIds.size;

    // Top actions
    const actionCounts: { [key: string]: number } = {};
    entries.forEach(e => {
      actionCounts[e.action] = (actionCounts[e.action] || 0) + 1;
    });
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top users
    const userCounts: { [key: string]: { username: string; count: number } } = {};
    entries.forEach(e => {
      if (!userCounts[e.userId]) {
        userCounts[e.userId] = { username: e.username, count: 0 };
      }
      userCounts[e.userId].count++;
    });
    const topUsers = Object.entries(userCounts)
      .map(([userId, data]) => ({ userId, username: data.username, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const successRate = entries.length > 0 
      ? (successCount / entries.length) * 100 
      : 0;

    return {
      totalEntries: entries.length,
      successCount,
      failureCount,
      warningCount,
      successRate,
      uniqueUsers,
      topActions,
      topUsers
    };
  }

  /**
   * Get recent activity
   */
  getRecentActivity(count: number = 20): AuditEntry[] {
    return this.entries.slice(0, count);
  }

  /**
   * Get user activity
   */
  getUserActivity(userId: string, limit?: number): AuditEntry[] {
    return this.getEntries({ userId }, limit);
  }

  /**
   * Get security events
   */
  getSecurityEvents(limit?: number): AuditEntry[] {
    const securityActions: AuditAction[] = [
      'user.login.failed',
      'security.breach.detected',
      'access.denied',
      'user.mfa.enabled',
      'user.mfa.disabled',
      'user.password.changed',
      'permission.changed'
    ];

    return this.entries
      .filter(e => securityActions.includes(e.action))
      .slice(0, limit);
  }

  /**
   * Get failed login attempts
   */
  getFailedLogins(limit?: number): AuditEntry[] {
    return this.getEntries({ action: 'user.login.failed' }, limit);
  }

  /**
   * Export audit trail to CSV
   */
  exportToCSV(filter?: AuditFilter): string {
    const entries = this.getEntries(filter);
    
    const headers = [
      'ID',
      'Timestamp',
      'Tenant ID',
      'User ID',
      'Username',
      'Action',
      'Resource',
      'Resource ID',
      'Status',
      'IP Address',
      'User Agent'
    ];

    const rows = entries.map(e => [
      e.id,
      e.timestamp.toISOString(),
      e.tenantId,
      e.userId,
      e.username,
      e.action,
      e.resource.type,
      e.resource.id,
      e.status,
      e.ipAddress,
      e.userAgent
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Clear old entries (older than specified days)
   */
  clearOldEntries(daysToKeep: number): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const beforeCount = this.entries.length;
    this.entries = this.entries.filter(e => e.timestamp >= cutoffDate);
    const afterCount = this.entries.length;

    this.saveEntries();
    this.entriesSubject.next(this.entries);

    console.log(`Cleared ${beforeCount - afterCount} old audit entries`);
  }

  /**
   * Clear all entries (use with caution!)
   */
  clearAll(): void {
    this.entries = [];
    this.saveEntries();
    this.entriesSubject.next(this.entries);
    console.log('Cleared all audit entries');
  }

  // Helper methods
  private getCurrentTenantId(): string {
    // In production, get from TenantService
    return localStorage.getItem('current_tenant_id') || 'tenant-1';
  }

  private getCurrentUserId(): string {
    // In production, get from AuthService
    return localStorage.getItem('current_user_id') || 'user-1';
  }

  private getCurrentUsername(): string {
    // In production, get from AuthService
    return localStorage.getItem('current_username') || 'admin';
  }

  private getClientIP(): string {
    // In production, this would come from server or proxy headers
    return 'unknown';
  }

  private saveEntries(): void {
    // Only save recent entries to localStorage (last 1000)
    const recentEntries = this.entries.slice(0, 1000);
    localStorage.setItem(this.AUDIT_KEY, JSON.stringify(recentEntries));
  }

  private loadEntries(): void {
    const saved = localStorage.getItem(this.AUDIT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Restore Date objects
      this.entries = parsed.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
    }
  }
}

