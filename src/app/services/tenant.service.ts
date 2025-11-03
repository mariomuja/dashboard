import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial' | 'inactive';
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  organizationIds: string[];
  settings: TenantSettings;
  createdAt: Date; // Add for direct access in templates
  metadata: {
    createdAt: Date;
    expiresAt?: Date;
    lastAccessAt: Date;
    ownerUserId: string;
  };
}

export interface TenantSettings {
  // Direct properties for template access
  maxUsers?: number;
  maxStorage?: number;
  allowedFeatures?: string[];
  customBranding?: boolean;
  
  // Nested settings
  isolation: {
    dataSegregation: boolean;
    networkIsolation: boolean;
    storageIsolation: boolean;
  };
  security: {
    mfaRequired: boolean;
    ipWhitelist: string[];
    sessionTimeout: number; // minutes
  };
  features: {
    maxOrganizations: number;
    maxUsers: number;
    maxStorageGB: number;
    allowedModules: string[];
  };
}

export interface TenantContext {
  tenantId: string;
  organizationId: string;
  userId: string;
  sessionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly TENANT_KEY = 'current_tenant';
  private readonly CONTEXT_KEY = 'tenant_context';
  
  private currentTenantSubject: BehaviorSubject<Tenant | null>;
  public currentTenant$: Observable<Tenant | null>;
  
  private contextSubject: BehaviorSubject<TenantContext | null>;
  public context$: Observable<TenantContext | null>;

  // Mock tenant database
  private tenants: Tenant[] = [
    {
      id: 'tenant-1',
      name: 'Acme Corporation',
      domain: 'acme.com',
      status: 'active',
      plan: 'enterprise',
      organizationIds: ['org-1', 'org-2', 'org-3'],
      createdAt: new Date('2024-01-01'),
      settings: {
        maxUsers: 500,
        maxStorage: 1000,
        allowedFeatures: ['dashboard', 'reports', 'analytics', 'admin'],
        customBranding: true,
        isolation: {
          dataSegregation: true,
          networkIsolation: true,
          storageIsolation: true
        },
        security: {
          mfaRequired: true,
          ipWhitelist: [],
          sessionTimeout: 480 // 8 hours
        },
        features: {
          maxOrganizations: 50,
          maxUsers: 500,
          maxStorageGB: 1000,
          allowedModules: ['dashboard', 'reports', 'analytics', 'admin']
        }
      },
      metadata: {
        createdAt: new Date('2024-01-01'),
        lastAccessAt: new Date(),
        ownerUserId: 'user-1'
      }
    },
    {
      id: 'tenant-2',
      name: 'TechStart Inc',
      domain: 'techstart.io',
      status: 'trial',
      plan: 'professional',
      organizationIds: ['org-4'],
      createdAt: new Date('2024-06-01'),
      settings: {
        maxUsers: 50,
        maxStorage: 100,
        allowedFeatures: ['dashboard', 'reports'],
        customBranding: false,
        isolation: {
          dataSegregation: true,
          networkIsolation: false,
          storageIsolation: true
        },
        security: {
          mfaRequired: false,
          ipWhitelist: [],
          sessionTimeout: 240 // 4 hours
        },
        features: {
          maxOrganizations: 10,
          maxUsers: 50,
          maxStorageGB: 100,
          allowedModules: ['dashboard', 'reports']
        }
      },
      metadata: {
        createdAt: new Date('2024-06-01'),
        expiresAt: new Date('2024-07-01'),
        lastAccessAt: new Date(),
        ownerUserId: 'user-10'
      }
    }
  ];

  constructor() {
    const savedTenant = this.loadTenant();
    this.currentTenantSubject = new BehaviorSubject<Tenant | null>(savedTenant);
    this.currentTenant$ = this.currentTenantSubject.asObservable();
    
    const savedContext = this.loadContext();
    this.contextSubject = new BehaviorSubject<TenantContext | null>(savedContext);
    this.context$ = this.contextSubject.asObservable();
  }

  getCurrentTenant(): Tenant | null {
    return this.currentTenantSubject.value;
  }

  setCurrentTenant(tenantId: string): void {
    const tenant = this.tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.metadata.lastAccessAt = new Date();
      this.saveTenant(tenant);
      this.currentTenantSubject.next(tenant);
      console.log(`Switched to tenant: ${tenant.name}`);
    }
  }

  getTenantById(tenantId: string): Tenant | undefined {
    return this.tenants.find(t => t.id === tenantId);
  }

  getActiveTenants(): Tenant[] {
    return this.tenants.filter(t => t.status === 'active');
  }

  // Tenant Isolation Methods
  isDataIsolated(tenantId: string): boolean {
    const tenant = this.getTenantById(tenantId);
    return tenant?.settings.isolation.dataSegregation || false;
  }

  canAccessOrganization(tenantId: string, organizationId: string): boolean {
    const tenant = this.getTenantById(tenantId);
    return tenant?.organizationIds.includes(organizationId) || false;
  }

  getIsolatedData(tenantId: string, dataType: string): any[] {
    // In production, this would query a database with tenant isolation
    const tenant = this.getTenantById(tenantId);
    if (!tenant) return [];
    
    console.log(`Fetching ${dataType} for tenant ${tenant.name} with isolation: ${tenant.settings.isolation.dataSegregation}`);
    // Return data filtered by tenant
    return [];
  }

  // Context Management
  setContext(context: TenantContext): void {
    this.saveContext(context);
    this.contextSubject.next(context);
  }

  getContext(): TenantContext | null {
    return this.contextSubject.value;
  }

  clearContext(): void {
    localStorage.removeItem(this.CONTEXT_KEY);
    this.contextSubject.next(null);
  }

  // Validation Methods
  validateTenantAccess(tenantId: string, userId: string): boolean {
    const tenant = this.getTenantById(tenantId);
    if (!tenant) return false;
    
    // Check if tenant is active
    if (tenant.status !== 'active' && tenant.status !== 'trial') {
      return false;
    }
    
    // Check if trial has expired
    if (tenant.status === 'trial' && tenant.metadata.expiresAt) {
      if (new Date() > tenant.metadata.expiresAt) {
        return false;
      }
    }
    
    return true;
  }

  checkFeatureAccess(tenantId: string, moduleName: string): boolean {
    const tenant = this.getTenantById(tenantId);
    if (!tenant) return false;
    
    return tenant.settings.features.allowedModules.includes(moduleName);
  }

  checkResourceLimit(tenantId: string, resource: 'users' | 'organizations' | 'storage'): {
    current: number;
    max: number;
    available: number;
  } {
    const tenant = this.getTenantById(tenantId);
    if (!tenant) {
      return { current: 0, max: 0, available: 0 };
    }
    
    let current = 0;
    let max = 0;
    
    switch (resource) {
      case 'organizations':
        current = tenant.organizationIds.length;
        max = tenant.settings.features.maxOrganizations;
        break;
      case 'users':
        current = 0; // Would count from database
        max = tenant.settings.features.maxUsers;
        break;
      case 'storage':
        current = 0; // Would calculate from storage
        max = tenant.settings.features.maxStorageGB;
        break;
    }
    
    return {
      current,
      max,
      available: Math.max(0, max - current)
    };
  }

  // Tenant Management
  createTenant(tenant: Partial<Tenant>): Tenant {
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: tenant.name || 'New Tenant',
      domain: tenant.domain || 'example.com',
      status: 'trial',
      plan: 'starter',
      organizationIds: [],
      createdAt: new Date(),
      settings: tenant.settings || this.getDefaultSettings(),
      metadata: {
        createdAt: new Date(),
        lastAccessAt: new Date(),
        ownerUserId: tenant.metadata?.ownerUserId || 'unknown'
      }
    };
    
    this.tenants.push(newTenant);
    console.log(`Created tenant: ${newTenant.name}`);
    return newTenant;
  }

  updateTenant(tenantId: string, updates: Partial<Tenant>): void {
    const index = this.tenants.findIndex(t => t.id === tenantId);
    if (index > -1) {
      this.tenants[index] = { ...this.tenants[index], ...updates };
      console.log(`Updated tenant: ${tenantId}`);
    }
  }

  suspendTenant(tenantId: string): void {
    this.updateTenant(tenantId, { status: 'suspended' });
  }

  activateTenant(tenantId: string): void {
    this.updateTenant(tenantId, { status: 'active' });
  }

  getAllTenants(): Tenant[] {
    return this.tenants;
  }

  deleteTenant(tenantId: string): void {
    const index = this.tenants.findIndex(t => t.id === tenantId);
    if (index > -1) {
      this.tenants.splice(index, 1);
      console.log(`Deleted tenant: ${tenantId}`);
    }
  }

  private getDefaultSettings(): TenantSettings {
    return {
      maxUsers: 10,
      maxStorage: 10,
      allowedFeatures: ['dashboard'],
      customBranding: false,
      isolation: {
        dataSegregation: true,
        networkIsolation: false,
        storageIsolation: true
      },
      security: {
        mfaRequired: false,
        ipWhitelist: [],
        sessionTimeout: 240
      },
      features: {
        maxOrganizations: 5,
        maxUsers: 10,
        maxStorageGB: 10,
        allowedModules: ['dashboard']
      }
    };
  }

  private saveTenant(tenant: Tenant): void {
    localStorage.setItem(this.TENANT_KEY, JSON.stringify(tenant));
  }

  private loadTenant(): Tenant | null {
    const saved = localStorage.getItem(this.TENANT_KEY);
    if (saved) {
      const tenant = JSON.parse(saved);
      // Restore Date objects
      tenant.metadata.createdAt = new Date(tenant.metadata.createdAt);
      tenant.metadata.lastAccessAt = new Date(tenant.metadata.lastAccessAt);
      if (tenant.metadata.expiresAt) {
        tenant.metadata.expiresAt = new Date(tenant.metadata.expiresAt);
      }
      return tenant;
    }
    return null;
  }

  private saveContext(context: TenantContext): void {
    localStorage.setItem(this.CONTEXT_KEY, JSON.stringify(context));
  }

  private loadContext(): TenantContext | null {
    const saved = localStorage.getItem(this.CONTEXT_KEY);
    return saved ? JSON.parse(saved) : null;
  }
}

