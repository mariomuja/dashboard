import { TestBed } from '@angular/core/testing';
import { OrganizationService } from '../../../app/services/organization.service';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get organizations', () => {
    const orgs = service.getOrganizations();
    expect(orgs.length).toBeGreaterThan(0);
  });

  it('should set organization', () => {
    const result = service.setOrganization('org-1');
    expect(result).toBe(true);
    expect(service.getCurrentOrganization()).toBeTruthy();
  });

  it('should check feature availability', () => {
    service.setOrganization('org-1');
    const hasFeature = service.hasFeature('dashboards');
    expect(typeof hasFeature).toBe('boolean');
  });

  it('should apply branding', () => {
    service.setOrganization('org-1');
    const org = service.getCurrentOrganization();
    if (org) {
      service.applyBranding(org);
      expect(document.documentElement.style.getPropertyValue('--primary-color')).toBeTruthy();
    }
  });
});

