import { TestBed } from '@angular/core/testing';
import { DashboardTemplatesService } from './dashboard-templates.service';

describe('DashboardTemplatesService', () => {
  let service: DashboardTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get templates', () => {
    const templates = service.getTemplates();
    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThan(0);
  });

  it('should get template by id', () => {
    const template = service.getTemplateById('executive-summary');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Executive Summary');
  });

  it('should get templates by category', () => {
    const salesTemplates = service.getTemplatesByCategory('sales');
    expect(salesTemplates).toBeDefined();
    expect(salesTemplates.length).toBeGreaterThan(0);
  });
});

