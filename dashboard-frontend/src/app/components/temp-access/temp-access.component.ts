import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TempAccessService, TempAccessGrant } from '../../services/temp-access.service';

@Component({
  selector: 'app-temp-access',
  templateUrl: './temp-access.component.html',
  styleUrls: ['./temp-access.component.css']
})
export class TempAccessComponent implements OnInit {
  grants: TempAccessGrant[] = [];
  expiringGrants: TempAccessGrant[] = [];
  resourcesInput = '';
  showNewGrantModal = false;
  
  // Simplified form model
  newGrant: {
    grantedTo?: string;
    resources?: string[];
    permissions?: string[];
    durationHours?: number;
    reason?: string;
  } = {
    permissions: ['view']
  };

  constructor(
    private tempAccessService: TempAccessService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGrants();
    this.loadExpiringGrants();
  }

  loadGrants(): void {
    this.grants = this.tempAccessService.getAllGrants();
  }

  loadExpiringGrants(): void {
    this.expiringGrants = this.tempAccessService.getExpiringGrants(24);
  }

  openNewGrantModal(): void {
    this.newGrant = {
      grantedTo: '',
      permissions: ['view'],
      durationHours: 24,
      reason: ''
    };
    this.resourcesInput = '';
    this.showNewGrantModal = true;
  }

  closeModal(): void {
    this.showNewGrantModal = false;
    this.newGrant = { permissions: ['view'] };
    this.resourcesInput = '';
  }

  createGrant(): void {
    if (!this.newGrant.grantedTo || !this.resourcesInput || !this.newGrant.durationHours) {
      alert('Please fill in all required fields');
      return;
    }

    // Parse resources from comma-separated input
    const resources = this.resourcesInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
    if (resources.length === 0) {
      alert('Please enter at least one resource');
      return;
    }

    const grant = this.tempAccessService.grantAccess(
      this.newGrant.grantedTo!,
      'tenant-1',
      'org-1',
      resources,
      this.newGrant.permissions!,
      this.newGrant.durationHours! * 60, // Convert hours to minutes
      this.newGrant.reason || 'No reason provided'
    );

    alert(`Access granted! Grant ID: ${grant.id}`);
    this.loadGrants();
    this.loadExpiringGrants();
    this.closeModal();
  }

  extendGrant(grantId: string): void {
    this.tempAccessService.extendAccess(grantId, 24 * 60); // Extend by 24 hours
    alert('Access extended by 24 hours');
    this.loadGrants();
    this.loadExpiringGrants();
  }

  revokeGrant(grantId: string): void {
    if (!confirm('Revoke this access grant?')) {
      return;
    }
    
    this.tempAccessService.revokeAccess(grantId);
    alert('Access revoked successfully');
    this.loadGrants();
    this.loadExpiringGrants();
  }

  revokeAccess(grant: TempAccessGrant): void {
    if (!confirm(`Revoke access for user "${grant.grantedTo}"?`)) {
      return;
    }

    this.tempAccessService.revokeAccess(grant.id);
    this.loadGrants();
    this.loadExpiringGrants();
    alert('Access revoked successfully!');
  }

  extendAccess(grant: TempAccessGrant): void {
    const hours = prompt('Extend access by how many hours?', '24');
    if (!hours) return;

    const hoursNum = parseInt(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert('Invalid number of hours');
      return;
    }

    this.tempAccessService.extendAccess(grant.id, hoursNum);
    this.loadGrants();
    this.loadExpiringGrants();
    alert(`Access extended by ${hoursNum} hours`);
  }

  getDefaultExpiry(): Date {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date;
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  }

  isExpired(expiresAt: Date): boolean {
    return new Date(expiresAt) < new Date();
  }

  isExpiringSoon(expiresAt: Date): boolean {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 && hours <= 24;
  }

  onPermissionChange(permission: string, checked: boolean): void {
    if (!this.newGrant.permissions) {
      this.newGrant.permissions = [];
    }
    
    if (checked) {
      if (!this.newGrant.permissions.includes(permission)) {
        this.newGrant.permissions.push(permission);
      }
    } else {
      this.newGrant.permissions = this.newGrant.permissions.filter((p: string) => p !== permission);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}


