import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService, Tenant } from '../../services/tenant.service';

@Component({
  selector: 'app-tenant-management',
  templateUrl: './tenant-management.component.html',
  styleUrls: ['./tenant-management.component.css']
})
export class TenantManagementComponent implements OnInit {
  tenants: Tenant[] = [];
  selectedTenant: Tenant | null = null;
  showEditModal = false;
  
  // Form fields
  editingTenant: Partial<Tenant> = {};
  isNewTenant = false;

  constructor(
    private tenantService: TenantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.tenants = this.tenantService.getAllTenants();
  }

  selectTenant(tenant: Tenant): void {
    this.selectedTenant = tenant;
  }

  openNewTenantModal(): void {
    this.isNewTenant = true;
    this.editingTenant = {
      id: this.generateTenantId(),
      name: '',
      domain: '',
      settings: {
        maxUsers: 50,
        maxStorage: 10,
        allowedFeatures: ['dashboard', 'reports'],
        customBranding: true,
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
          maxOrganizations: 10,
          maxUsers: 50,
          maxStorageGB: 10,
          allowedModules: ['dashboard', 'reports']
        }
      },
      status: 'active',
      createdAt: new Date()
    };
    this.showEditModal = true;
  }

  openEditModal(tenant: Tenant): void {
    this.isNewTenant = false;
    this.editingTenant = { ...tenant };
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
    this.editingTenant = {};
  }

  saveTenant(): void {
    if (!this.editingTenant.name || !this.editingTenant.domain) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.isNewTenant) {
      this.tenantService.createTenant(this.editingTenant as Omit<Tenant, 'id'>);
      alert('Tenant created successfully!');
    } else {
      this.tenantService.updateTenant(this.editingTenant.id!, this.editingTenant);
      alert('Tenant updated successfully!');
    }

    this.loadTenants();
    this.closeModal();
  }

  deleteTenant(tenant: Tenant): void {
    if (!confirm(`Delete tenant "${tenant.name}"? This action cannot be undone.`)) {
      return;
    }

    this.tenantService.deleteTenant(tenant.id);
    this.loadTenants();
    if (this.selectedTenant?.id === tenant.id) {
      this.selectedTenant = null;
    }
    alert('Tenant deleted successfully!');
  }

  suspendTenant(tenant: Tenant): void {
    this.tenantService.updateTenant(tenant.id, { status: 'suspended' });
    this.loadTenants();
    alert(`Tenant "${tenant.name}" suspended`);
  }

  activateTenant(tenant: Tenant): void {
    this.tenantService.updateTenant(tenant.id, { status: 'active' });
    this.loadTenants();
    alert(`Tenant "${tenant.name}" activated`);
  }

  generateTenantId(): string {
    return 'tenant-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return '✅';
      case 'suspended': return '⏸️';
      case 'trial': return '🔄';
      default: return '❓';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#10b981';
      case 'suspended': return '#ef4444';
      case 'trial': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  formatDate(date: Date | undefined): string {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

