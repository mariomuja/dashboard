import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TemporaryAccess {
  id: string;
  grantedBy: string;
  grantedTo: string;
  tenantId: string;
  organizationId: string;
  resources: string[];
  permissions: Permission[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'revoked';
  reason: string;
  conditions?: AccessConditions;
  usageLog: AccessLog[];
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'execute')[];
}

export interface AccessConditions {
  ipWhitelist?: string[];
  maxUses?: number;
  requireMFA?: boolean;
  allowedHours?: { start: number; end: number }; // 0-23
}

export interface AccessLog {
  timestamp: Date;
  action: string;
  resource: string;
  success: boolean;
  ipAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class TempAccessService {
  private readonly STORAGE_KEY = 'temp_access_grants';
  
  private grants: TemporaryAccess[] = [];
  private grantsSubject: BehaviorSubject<TemporaryAccess[]>;
  public grants$: Observable<TemporaryAccess[]>;

  constructor() {
    this.loadGrants();
    this.grantsSubject = new BehaviorSubject<TemporaryAccess[]>(this.grants);
    this.grants$ = this.grantsSubject.asObservable();
    
    // Check for expired grants periodically
    setInterval(() => this.checkExpiredGrants(), 60000); // Every minute
  }

  /**
   * Grant temporary access
   */
  grantAccess(
    grantedTo: string,
    tenantId: string,
    organizationId: string,
    resources: string[],
    permissions: Permission[],
    durationMinutes: number,
    reason: string,
    conditions?: AccessConditions
  ): TemporaryAccess {
    const now = new Date();
    const endDate = new Date(now.getTime() + durationMinutes * 60000);

    const grant: TemporaryAccess = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      grantedBy: this.getCurrentUserId(),
      grantedTo,
      tenantId,
      organizationId,
      resources,
      permissions,
      startDate: now,
      endDate,
      status: 'active',
      reason,
      conditions,
      usageLog: [],
      createdAt: now
    };

    this.grants.push(grant);
    this.saveGrants();
    this.grantsSubject.next(this.grants);

    console.log(`Granted temporary access to ${grantedTo} until ${endDate.toLocaleString()}`);
    return grant;
  }

  /**
   * Revoke temporary access
   */
  revokeAccess(grantId: string): void {
    const grant = this.grants.find(g => g.id === grantId);
    if (grant) {
      grant.status = 'revoked';
      this.saveGrants();
      this.grantsSubject.next(this.grants);
      console.log(`Revoked temporary access: ${grantId}`);
    }
  }

  /**
   * Check if user has temporary access to resource
   */
  hasAccess(userId: string, tenantId: string, resource: string, action: 'read' | 'write' | 'delete' | 'execute'): boolean {
    const now = new Date();
    
    const activeGrants = this.grants.filter(g =>
      g.grantedTo === userId &&
      g.tenantId === tenantId &&
      g.status === 'active' &&
      g.startDate <= now &&
      g.endDate >= now &&
      g.resources.includes(resource)
    );

    for (const grant of activeGrants) {
      // Check conditions
      if (!this.checkConditions(grant)) {
        continue;
      }

      // Check permissions
      const permission = grant.permissions.find(p => p.resource === resource);
      if (permission && permission.actions.includes(action)) {
        // Log access
        this.logAccess(grant.id, action, resource, true);
        return true;
      }
    }

    return false;
  }

  /**
   * Get all grants for a user
   */
  getUserGrants(userId: string): TemporaryAccess[] {
    return this.grants.filter(g => g.grantedTo === userId || g.grantedBy === userId);
  }

  /**
   * Get active grants
   */
  getActiveGrants(tenantId?: string): TemporaryAccess[] {
    let filtered = this.grants.filter(g => g.status === 'active');
    
    if (tenantId) {
      filtered = filtered.filter(g => g.tenantId === tenantId);
    }
    
    return filtered;
  }

  /**
   * Get expired grants
   */
  getExpiredGrants(tenantId?: string): TemporaryAccess[] {
    let filtered = this.grants.filter(g => g.status === 'expired');
    
    if (tenantId) {
      filtered = filtered.filter(g => g.tenantId === tenantId);
    }
    
    return filtered;
  }

  /**
   * Extend access duration
   */
  extendAccess(grantId: string, additionalMinutes: number): void {
    const grant = this.grants.find(g => g.id === grantId);
    if (grant && grant.status === 'active') {
      grant.endDate = new Date(grant.endDate.getTime() + additionalMinutes * 60000);
      this.saveGrants();
      this.grantsSubject.next(this.grants);
      console.log(`Extended access ${grantId} by ${additionalMinutes} minutes`);
    }
  }

  /**
   * Get grant details
   */
  getGrantDetails(grantId: string): TemporaryAccess | undefined {
    return this.grants.find(g => g.id === grantId);
  }

  /**
   * Get grants expiring soon (within next hour)
   */
  getExpiringGrants(tenantId?: string): TemporaryAccess[] {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60000);

    let filtered = this.grants.filter(g =>
      g.status === 'active' &&
      g.endDate > now &&
      g.endDate <= oneHourLater
    );

    if (tenantId) {
      filtered = filtered.filter(g => g.tenantId === tenantId);
    }

    return filtered;
  }

  /**
   * Log access usage
   */
  private logAccess(grantId: string, action: string, resource: string, success: boolean): void {
    const grant = this.grants.find(g => g.id === grantId);
    if (grant) {
      grant.lastUsedAt = new Date();
      grant.usageLog.push({
        timestamp: new Date(),
        action,
        resource,
        success,
        ipAddress: 'unknown' // Would get from HTTP request
      });

      // Check max uses condition
      if (grant.conditions?.maxUses) {
        const usageCount = grant.usageLog.filter(l => l.success).length;
        if (usageCount >= grant.conditions.maxUses) {
          grant.status = 'expired';
          console.log(`Grant ${grantId} expired due to max uses reached`);
        }
      }

      this.saveGrants();
      this.grantsSubject.next(this.grants);
    }
  }

  /**
   * Check access conditions
   */
  private checkConditions(grant: TemporaryAccess): boolean {
    if (!grant.conditions) return true;

    // Check IP whitelist
    if (grant.conditions.ipWhitelist && grant.conditions.ipWhitelist.length > 0) {
      const clientIP = 'unknown'; // Would get from HTTP request
      if (!grant.conditions.ipWhitelist.includes(clientIP)) {
        return false;
      }
    }

    // Check allowed hours
    if (grant.conditions.allowedHours) {
      const currentHour = new Date().getHours();
      const { start, end } = grant.conditions.allowedHours;
      if (currentHour < start || currentHour > end) {
        return false;
      }
    }

    // Check max uses
    if (grant.conditions.maxUses) {
      const usageCount = grant.usageLog.filter(l => l.success).length;
      if (usageCount >= grant.conditions.maxUses) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check for expired grants and update status
   */
  private checkExpiredGrants(): void {
    const now = new Date();
    let updated = false;

    for (const grant of this.grants) {
      if (grant.status === 'active' && grant.endDate < now) {
        grant.status = 'expired';
        updated = true;
        console.log(`Grant ${grant.id} expired`);
      }
    }

    if (updated) {
      this.saveGrants();
      this.grantsSubject.next(this.grants);
    }
  }

  /**
   * Clean up old grants
   */
  cleanupOldGrants(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const beforeCount = this.grants.length;
    this.grants = this.grants.filter(g =>
      g.status === 'active' || g.createdAt >= cutoffDate
    );
    const afterCount = this.grants.length;

    this.saveGrants();
    this.grantsSubject.next(this.grants);

    console.log(`Cleaned up ${beforeCount - afterCount} old grants`);
  }

  /**
   * Export grants to CSV
   */
  exportToCSV(): string {
    const headers = [
      'ID',
      'Granted By',
      'Granted To',
      'Tenant ID',
      'Organization ID',
      'Resources',
      'Start Date',
      'End Date',
      'Status',
      'Reason',
      'Times Used'
    ];

    const rows = this.grants.map(g => [
      g.id,
      g.grantedBy,
      g.grantedTo,
      g.tenantId,
      g.organizationId,
      g.resources.join(';'),
      g.startDate.toISOString(),
      g.endDate.toISOString(),
      g.status,
      g.reason,
      g.usageLog.length.toString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  // Helper methods
  private getCurrentUserId(): string {
    return localStorage.getItem('current_user_id') || 'admin';
  }

  private saveGrants(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.grants));
  }

  private loadGrants(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.grants = parsed.map((g: any) => ({
        ...g,
        startDate: new Date(g.startDate),
        endDate: new Date(g.endDate),
        createdAt: new Date(g.createdAt),
        lastUsedAt: g.lastUsedAt ? new Date(g.lastUsedAt) : undefined,
        usageLog: g.usageLog.map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp)
        }))
      }));
    }
  }
}

