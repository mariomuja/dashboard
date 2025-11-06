import { TestBed } from '@angular/core/testing';
import { TenantService, Tenant } from '../../../app/services/tenant.service';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentTenant', () => {
    it('should return null initially', () => {
      const tenant = service.getCurrentTenant();
      expect(tenant).toBeNull();
    });
  });

  describe('setCurrentTenant', () => {
    it('should set current tenant', () => {
      service.setCurrentTenant('tenant-1');
      const tenant = service.getCurrentTenant();
      
      expect(tenant).toBeDefined();
      expect(tenant?.id).toBe('tenant-1');
    });

    it('should update lastAccessAt', () => {
      const beforeTime = Date.now();
      service.setCurrentTenant('tenant-1');
      const afterTime = Date.now();
      
      const tenant = service.getCurrentTenant();
      const accessTime = tenant?.metadata.lastAccessAt.getTime() || 0;
      
      expect(accessTime).toBeGreaterThanOrEqual(beforeTime);
      expect(accessTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('getTenantById', () => {
    it('should return tenant by ID', () => {
      const tenant = service.getTenantById('tenant-1');
      expect(tenant).toBeDefined();
      expect(tenant?.id).toBe('tenant-1');
    });

    it('should return undefined for invalid ID', () => {
      const tenant = service.getTenantById('invalid-id');
      expect(tenant).toBeUndefined();
    });
  });

  describe('getAllTenants', () => {
    it('should return all tenants', () => {
      const tenants = service.getAllTenants();
      expect(tenants.length).toBeGreaterThan(0);
    });
  });

  describe('getActiveTenants', () => {
    it('should return only active tenants', () => {
      const tenants = service.getActiveTenants();
      expect(tenants.every(t => t.status === 'active')).toBe(true);
    });
  });

  describe('isDataIsolated', () => {
    it('should return true for tenant with data segregation', () => {
      const isolated = service.isDataIsolated('tenant-1');
      expect(isolated).toBe(true);
    });
  });

  describe('canAccessOrganization', () => {
    it('should return true for tenant organizations', () => {
      const canAccess = service.canAccessOrganization('tenant-1', 'org-1');
      expect(canAccess).toBe(true);
    });

    it('should return false for other tenant organizations', () => {
      const canAccess = service.canAccessOrganization('tenant-1', 'org-99');
      expect(canAccess).toBe(false);
    });
  });

  describe('validateTenantAccess', () => {
    it('should return true for active tenant', () => {
      const valid = service.validateTenantAccess('tenant-1', 'user-1');
      expect(valid).toBe(true);
    });

    it('should return false for suspended tenant', () => {
      service.suspendTenant('tenant-1');
      const valid = service.validateTenantAccess('tenant-1', 'user-1');
      expect(valid).toBe(false);
    });
  });

  describe('checkFeatureAccess', () => {
    it('should return true for allowed module', () => {
      const hasAccess = service.checkFeatureAccess('tenant-1', 'dashboard');
      expect(hasAccess).toBe(true);
    });

    it('should return false for disallowed module', () => {
      const hasAccess = service.checkFeatureAccess('tenant-1', 'unknown-module');
      expect(hasAccess).toBe(false);
    });
  });

  describe('checkResourceLimit', () => {
    it('should return resource limits', () => {
      const limit = service.checkResourceLimit('tenant-1', 'organizations');
      
      expect(limit.current).toBeDefined();
      expect(limit.max).toBeDefined();
      expect(limit.available).toBeDefined();
      expect(limit.available).toBe(limit.max - limit.current);
    });

    it('should return zero for invalid tenant', () => {
      const limit = service.checkResourceLimit('invalid', 'users');
      
      expect(limit.current).toBe(0);
      expect(limit.max).toBe(0);
      expect(limit.available).toBe(0);
    });
  });

  describe('createTenant', () => {
    it('should create new tenant', () => {
      const newTenant = service.createTenant({
        name: 'New Company',
        domain: 'newcompany.com',
        metadata: { ownerUserId: 'user-10', createdAt: new Date(), lastAccessAt: new Date() }
      });

      expect(newTenant).toBeDefined();
      expect(newTenant.id).toContain('tenant-');
      expect(newTenant.name).toBe('New Company');
      expect(newTenant.status).toBe('trial');
    });
  });

  describe('updateTenant', () => {
    it('should update tenant properties', () => {
      service.updateTenant('tenant-1', { name: 'Updated Name' });
      const tenant = service.getTenantById('tenant-1');
      
      expect(tenant?.name).toBe('Updated Name');
    });
  });

  describe('suspendTenant', () => {
    it('should suspend tenant', () => {
      service.suspendTenant('tenant-1');
      const tenant = service.getTenantById('tenant-1');
      
      expect(tenant?.status).toBe('suspended');
    });
  });

  describe('activateTenant', () => {
    it('should activate tenant', () => {
      service.suspendTenant('tenant-1');
      service.activateTenant('tenant-1');
      const tenant = service.getTenantById('tenant-1');
      
      expect(tenant?.status).toBe('active');
    });
  });
});

