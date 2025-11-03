import { Component, OnInit } from '@angular/core';
import { OrganizationService, Organization } from '../../services/organization.service';

@Component({
  selector: 'app-organization-selector',
  templateUrl: './organization-selector.component.html',
  styleUrls: ['./organization-selector.component.css']
})
export class OrganizationSelectorComponent implements OnInit {
  organizations: Organization[] = [];
  currentOrg: Organization | null = null;
  showSelector = false;

  constructor(private orgService: OrganizationService) {}

  ngOnInit(): void {
    this.organizations = this.orgService.getOrganizations();
    this.orgService.currentOrg$.subscribe(org => {
      this.currentOrg = org;
    });
  }

  toggleSelector(): void {
    this.showSelector = !this.showSelector;
  }

  selectOrganization(orgId: string): void {
    this.orgService.setOrganization(orgId);
    this.showSelector = false;
  }

  getOrgIcon(type: string): string {
    switch (type) {
      case 'company': return '🏢';
      case 'division': return '📂';
      case 'department': return '📁';
      case 'team': return '👥';
      default: return '📊';
    }
  }
}

