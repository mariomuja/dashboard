import { TestBed } from '@angular/core/testing';
import { TempAccessService, Permission } from './temp-access.service';

describe('TempAccessService', () => {
  let service: TempAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TempAccessService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('grantAccess', () => {
    it('should grant temporary access', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      const grant = service.grantAccess(
        'user-2',
        'tenant-1',
        'org-1',
        ['dashboard'],
        permissions,
        60,
        'Testing access'
      );

      expect(grant).toBeDefined();
      expect(grant.grantedTo).toBe('user-2');
      expect(grant.status).toBe('active');
    });

    it('should calculate correct end date', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      const beforeGrant = Date.now();
      const grant = service.grantAccess(
        'user-2',
        'tenant-1',
        'org-1',
        ['dashboard'],
        permissions,
        60,
        'Testing'
      );
      const afterGrant = Date.now();

      const expectedEnd = beforeGrant + (60 * 60000);
      const actualEnd = grant.endDate.getTime();

      expect(actualEnd).toBeGreaterThanOrEqual(expectedEnd);
      expect(actualEnd).toBeLessThanOrEqual(afterGrant + (60 * 60000));
    });
  });

  describe('revokeAccess', () => {
    it('should revoke access', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      const grant = service.grantAccess(
        'user-2',
        'tenant-1',
        'org-1',
        ['dashboard'],
        permissions,
        60,
        'Testing'
      );

      service.revokeAccess(grant.id);

      const updated = service.getGrantDetails(grant.id);
      expect(updated?.status).toBe('revoked');
    });
  });

  describe('hasAccess', () => {
    it('should return true for valid access', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read', 'write'] }
      ];

      service.grantAccess(
        'user-2',
        'tenant-1',
        'org-1',
        ['dashboard'],
        permissions,
        60,
        'Testing'
      );

      const hasAccess = service.hasAccess('user-2', 'tenant-1', 'dashboard', 'read');
      expect(hasAccess).toBe(true);
    });

    it('should return false for wrong action', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      service.grantAccess(
        'user-2',
        'tenant-1',
        'org-1',
        ['dashboard'],
        permissions,
        60,
        'Testing'
      );

      const hasAccess = service.hasAccess('user-2', 'tenant-1', 'dashboard', 'delete');
      expect(hasAccess).toBe(false);
    });

    it('should return false for revoked access', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      const grant = service.grantAccess(
        'user-2',
        'tenant-1',
        'org-1',
        ['dashboard'],
        permissions,
        60,
        'Testing'
      );

      service.revokeAccess(grant.id);

      const hasAccess = service.hasAccess('user-2', 'tenant-1', 'dashboard', 'read');
      expect(hasAccess).toBe(false);
    });
  });

  describe('getUserGrants', () => {
    it('should return grants for user', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      service.grantAccess('user-2', 'tenant-1', 'org-1', ['dashboard'], permissions, 60, 'Test 1');
      service.grantAccess('user-2', 'tenant-1', 'org-1', ['reports'], permissions, 60, 'Test 2');
      service.grantAccess('user-3', 'tenant-1', 'org-1', ['dashboard'], permissions, 60, 'Test 3');

      const grants = service.getUserGrants('user-2');
      expect(grants.length).toBe(2);
    });
  });

  describe('getActiveGrants', () => {
    it('should return only active grants', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      const grant1 = service.grantAccess('user-2', 'tenant-1', 'org-1', ['dashboard'], permissions, 60, 'Test');
      service.grantAccess('user-3', 'tenant-1', 'org-1', ['dashboard'], permissions, 60, 'Test');
      
      service.revokeAccess(grant1.id);

      const active = service.getActiveGrants();
      expect(active.length).toBe(1);
      expect(active.every(g => g.status === 'active')).toBe(true);
    });

    it('should filter by tenant', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      service.grantAccess('user-2', 'tenant-1', 'org-1', ['dashboard'], permissions, 60, 'Test');
      service.grantAccess('user-3', 'tenant-2', 'org-2', ['dashboard'], permissions, 60, 'Test');

      const active = service.getActiveGrants('tenant-1');
      expect(active.length).toBe(1);
      expect(active[0].tenantId).toBe('tenant-1');
    });
  });

  describe('extendAccess', () => {
    it('should extend access duration', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      const grant = service.grantAccess(
        'user-2',
        'tenant-1',
        'org-1',
        ['dashboard'],
        permissions,
        60,
        'Testing'
      );

      const originalEndDate = new Date(grant.endDate);
      service.extendAccess(grant.id, 30);

      const updated = service.getGrantDetails(grant.id);
      const expectedEndDate = new Date(originalEndDate.getTime() + (30 * 60000));

      expect(updated?.endDate.getTime()).toBe(expectedEndDate.getTime());
    });
  });

  describe('getExpiringGrants', () => {
    it('should return grants expiring within an hour', () => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      // Grant expiring in 30 minutes
      service.grantAccess('user-2', 'tenant-1', 'org-1', ['dashboard'], permissions, 30, 'Expiring soon');
      
      // Grant expiring in 2 hours
      service.grantAccess('user-3', 'tenant-1', 'org-1', ['dashboard'], permissions, 120, 'Not expiring soon');

      const expiring = service.getExpiringGrants();
      expect(expiring.length).toBe(1);
    });
  });

  describe('exportToCSV', () => {
    beforeEach(() => {
      const permissions: Permission[] = [
        { resource: 'dashboard', actions: ['read'] }
      ];

      service.grantAccess('user-2', 'tenant-1', 'org-1', ['dashboard'], permissions, 60, 'Test');
    });

    it('should export grants to CSV', () => {
      const csv = service.exportToCSV();
      
      expect(csv).toContain('ID,Granted By,Granted To');
      expect(csv).toContain('user-2');
      expect(csv).toContain('tenant-1');
    });
  });
});

