import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  type: 'company' | 'division' | 'department' | 'team';
  settings: OrganizationSettings;
  members: string[]; // user IDs
  createdAt: Date;
}

export interface OrganizationSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    theme: 'light' | 'dark' | 'auto';
  };
  features: {
    dashboards: boolean;
    exports: boolean;
    emailReports: boolean;
    customization: boolean;
    aiInsights: boolean;
  };
  limits: {
    maxUsers: number;
    maxDashboards: number;
    dataRetentionDays: number;
    storageGB: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly ORG_KEY = 'current_organization';
  private currentOrgSubject: BehaviorSubject<Organization | null>;
  public currentOrg$: Observable<Organization | null>;

  // Mock organization database
  private organizations: Organization[] = [
    {
      id: 'org-1',
      name: 'Acme Corporation',
      type: 'company',
      settings: {
        branding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
          companyName: 'Acme Corporation',
          theme: 'auto'
        },
        features: {
          dashboards: true,
          exports: true,
          emailReports: true,
          customization: true,
          aiInsights: true
        },
        limits: {
          maxUsers: 100,
          maxDashboards: 50,
          dataRetentionDays: 365,
          storageGB: 100
        }
      },
      members: ['user-1', 'user-2'],
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'org-2',
      name: 'Sales Division',
      parentId: 'org-1',
      type: 'division',
      settings: {
        branding: {
          primaryColor: '#10b981',
          secondaryColor: '#3b82f6',
          companyName: 'Sales Division',
          theme: 'light'
        },
        features: {
          dashboards: true,
          exports: true,
          emailReports: true,
          customization: true,
          aiInsights: true
        },
        limits: {
          maxUsers: 25,
          maxDashboards: 10,
          dataRetentionDays: 180,
          storageGB: 25
        }
      },
      members: ['user-3'],
      createdAt: new Date('2024-02-01')
    },
    {
      id: 'org-3',
      name: 'Marketing Team',
      parentId: 'org-1',
      type: 'team',
      settings: {
        branding: {
          primaryColor: '#10b981',
          secondaryColor: '#3b82f6',
          companyName: 'Marketing Team',
          theme: 'light'
        },
        features: {
          dashboards: true,
          exports: true,
          emailReports: false,
          customization: true,
          aiInsights: true
        },
        limits: {
          maxUsers: 10,
          maxDashboards: 5,
          dataRetentionDays: 90,
          storageGB: 10
        }
      },
      members: ['user-4'],
      createdAt: new Date('2024-03-01')
    }
  ];

  constructor() {
    const savedOrg = this.loadOrganization();
    this.currentOrgSubject = new BehaviorSubject<Organization | null>(savedOrg);
    this.currentOrg$ = this.currentOrgSubject.asObservable();

    // Apply branding if organization is set
    if (savedOrg) {
      this.applyBranding(savedOrg);
    }
  }

  getCurrentOrganization(): Organization | null {
    return this.currentOrgSubject.value;
  }

  setOrganization(orgId: string): boolean {
    const org = this.organizations.find(o => o.id === orgId);
    if (org) {
      this.currentOrgSubject.next(org);
      this.saveOrganization(org);
      this.applyBranding(org);
      return true;
    }
    return false;
  }

  getOrganizations(): Organization[] {
    return this.organizations;
  }

  getOrganizationById(id: string): Organization | undefined {
    return this.organizations.find(o => o.id === id);
  }

  getChildOrganizations(parentId: string): Organization[] {
    return this.organizations.filter(o => o.parentId === parentId);
  }

  hasFeature(feature: keyof OrganizationSettings['features']): boolean {
    const org = this.getCurrentOrganization();
    return org ? org.settings.features[feature] : false;
  }

  isWithinLimit(limit: keyof OrganizationSettings['limits'], current: number): boolean {
    const org = this.getCurrentOrganization();
    if (!org) return false;
    return current < org.settings.limits[limit];
  }

  applyBranding(org: Organization): void {
    const branding = org.settings.branding;
    
    // Apply primary color
    document.documentElement.style.setProperty('--primary-color', branding.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', branding.secondaryColor);
    
    // Ensure button text is always white for filled buttons
    document.documentElement.style.setProperty('--button-text-color', '#ffffff');
    
    // Update page title
    document.title = `${branding.companyName} - KPI Dashboard`;
    
    // Apply theme if specified
    if (branding.theme && branding.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', branding.theme);
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${branding.theme}-theme`);
    }

    console.log(`Branding applied for: ${branding.companyName}`);
  }

  updateBranding(settings: Partial<OrganizationSettings['branding']>): void {
    const org = this.getCurrentOrganization();
    if (org) {
      org.settings.branding = { ...org.settings.branding, ...settings };
      this.applyBranding(org);
      this.saveOrganization(org);
    }
  }

  private saveOrganization(org: Organization): void {
    localStorage.setItem(this.ORG_KEY, JSON.stringify(org));
  }

  private loadOrganization(): Organization | null {
    const saved = localStorage.getItem(this.ORG_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  clearOrganization(): void {
    localStorage.removeItem(this.ORG_KEY);
    this.currentOrgSubject.next(null);
  }
}

