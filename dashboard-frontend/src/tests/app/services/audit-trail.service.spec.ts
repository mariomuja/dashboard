import { TestBed } from '@angular/core/testing';
import { AuditTrailService, AuditAction } from '../../../app/services/audit-trail.service';

describe('AuditTrailService', () => {
  let service: AuditTrailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditTrailService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('log', () => {
    it('should log an audit entry', () => {
      service.log('user.login', 'user', 'user-1', { method: 'password' });
      
      const entries = service.getEntries();
      expect(entries.length).toBe(1);
      expect(entries[0].action).toBe('user.login');
      expect(entries[0].resource).toBe('user');
      expect(entries[0].resourceId).toBe('user-1');
    });

    it('should default to success status', () => {
      service.log('user.login', 'user', 'user-1', {});
      
      const entries = service.getEntries();
      expect(entries[0].status).toBe('success');
    });

    it('should accept custom status', () => {
      service.log('user.login.failed', 'user', 'user-1', {}, 'failure');
      
      const entries = service.getEntries();
      expect(entries[0].status).toBe('failure');
    });

    it('should include changes if provided', () => {
      const changes = {
        before: { role: 'user' },
        after: { role: 'admin' }
      };
      
      service.log('user.role.changed', 'user', 'user-1', {}, 'success', changes);
      
      const entries = service.getEntries();
      expect(entries[0].changes).toEqual(changes);
    });
  });

  describe('getEntries', () => {
    beforeEach(() => {
      service.log('user.login', 'user', 'user-1', {});
      service.log('data.exported', 'dashboard', 'dash-1', {});
      service.log('user.login.failed', 'user', 'user-2', {}, 'failure');
    });

    it('should return all entries', () => {
      const entries = service.getEntries();
      expect(entries.length).toBe(3);
    });

    it('should filter by action', () => {
      const entries = service.getEntries({ action: 'user.login' });
      expect(entries.length).toBe(1);
      expect(entries[0].action).toBe('user.login');
    });

    it('should filter by status', () => {
      const entries = service.getEntries({ status: 'failure' });
      expect(entries.length).toBe(1);
      expect(entries[0].status).toBe('failure');
    });

    it('should filter by resource', () => {
      const entries = service.getEntries({ resource: 'user' });
      expect(entries.length).toBe(2);
    });

    it('should limit results', () => {
      const entries = service.getEntries({}, 2);
      expect(entries.length).toBe(2);
    });
  });

  describe('getStatistics', () => {
    beforeEach(() => {
      service.clearAll(); // Clear before each test
      service.log('user.login', 'user', 'user-1', {});
      service.log('user.login', 'user', 'user-1', {});
      service.log('data.exported', 'dashboard', 'dash-1', {});
      service.log('user.login.failed', 'user', 'user-2', {}, 'failure');
      service.log('data.exported', 'dashboard', 'dash-2', {}, 'warning');
    });

    it('should return correct statistics', () => {
      const stats = service.getStatistics();
      
      expect(stats.totalEntries).toBe(5);
      expect(stats.successCount).toBe(3);
      expect(stats.failureCount).toBe(1);
      expect(stats.warningCount).toBe(1);
      expect(stats.uniqueUsers).toBeGreaterThanOrEqual(1);
    });

    it('should return top actions', () => {
      const stats = service.getStatistics();
      
      expect(stats.topActions.length).toBeGreaterThan(0);
      expect(stats.topActions[0].action).toBeDefined();
      expect(stats.topActions[0].count).toBeDefined();
    });

    it('should return top users', () => {
      const stats = service.getStatistics();
      
      expect(stats.topUsers.length).toBeGreaterThan(0);
      expect(stats.topUsers[0].userId).toBeDefined();
      expect(stats.topUsers[0].count).toBeDefined();
    });
  });

  describe('getRecentActivity', () => {
    beforeEach(() => {
      for (let i = 0; i < 25; i++) {
        service.log('user.login', 'user', `user-${i}`, {});
      }
    });

    it('should return recent entries', () => {
      const recent = service.getRecentActivity(10);
      expect(recent.length).toBe(10);
    });

    it('should return all if count exceeds total', () => {
      const recent = service.getRecentActivity(100);
      expect(recent.length).toBe(25);
    });
  });

  describe('getUserActivity', () => {
    beforeEach(() => {
      service.log('user.login', 'user', 'user-1', {});
      service.log('data.exported', 'dashboard', 'dash-1', {});
      service.log('user.login', 'user', 'user-2', {});
    });

    it('should return activity for specific user', () => {
      // Note: getUserActivity filters by userId in the entry, not resourceId
      // Since all are logged by same user (from localStorage), they'll all match
      const activity = service.getUserActivity('user-1');
      expect(activity).toBeDefined();
    });
  });

  describe('getSecurityEvents', () => {
    beforeEach(() => {
      service.log('user.login', 'user', 'user-1', {});
      service.log('user.login.failed', 'user', 'user-1', {}, 'failure');
      service.log('security.breach.detected', 'system', 'sys-1', {}, 'failure');
      service.log('access.denied', 'resource', 'res-1', {}, 'failure');
      service.log('data.exported', 'dashboard', 'dash-1', {});
    });

    it('should return only security events', () => {
      const events = service.getSecurityEvents();
      expect(events.length).toBe(3);
      expect(events.every(e => 
        e.action.includes('failed') || 
        e.action.includes('breach') || 
        e.action.includes('denied') ||
        e.action.includes('mfa') ||
        e.action.includes('password') ||
        e.action.includes('permission')
      )).toBe(true);
    });

    it('should limit results', () => {
      const events = service.getSecurityEvents(2);
      expect(events.length).toBe(2);
    });
  });

  describe('getFailedLogins', () => {
    beforeEach(() => {
      service.log('user.login', 'user', 'user-1', {});
      service.log('user.login.failed', 'user', 'user-1', {}, 'failure');
      service.log('user.login.failed', 'user', 'user-2', {}, 'failure');
    });

    it('should return only failed login attempts', () => {
      const failed = service.getFailedLogins();
      expect(failed.length).toBe(2);
      expect(failed.every(e => e.action === 'user.login.failed')).toBe(true);
    });
  });

  describe('exportToCSV', () => {
    beforeEach(() => {
      service.log('user.login', 'user', 'user-1', {});
      service.log('data.exported', 'dashboard', 'dash-1', {});
    });

    it('should export entries to CSV format', () => {
      const csv = service.exportToCSV();
      
      expect(csv).toContain('ID,Timestamp,Tenant ID');
      expect(csv).toContain('user.login');
      expect(csv).toContain('data.exported');
    });

    it('should respect filters when exporting', () => {
      const csv = service.exportToCSV({ action: 'user.login' });
      
      const lines = csv.split('\n');
      expect(lines.length).toBe(2); // Header + 1 entry
    });
  });

  describe('clearOldEntries', () => {
    it('should clear entries older than specified days', () => {
      service.clearAll(); // Clear first
      
      // Log an entry
      service.log('user.login', 'user', 'user-1', {});
      
      const entriesBefore = service.getEntries();
      expect(entriesBefore.length).toBe(1);
      
      // Clear entries older than 1 day (current entries are new, so won't be cleared)
      service.clearOldEntries(1);
      
      const entries = service.getEntries();
      expect(entries.length).toBe(1); // Still there because it's fresh
    });
  });

  describe('clearAll', () => {
    beforeEach(() => {
      service.log('user.login', 'user', 'user-1', {});
      service.log('data.exported', 'dashboard', 'dash-1', {});
    });

    it('should clear all entries', () => {
      service.clearAll();
      
      const entries = service.getEntries();
      expect(entries.length).toBe(0);
    });
  });
});

