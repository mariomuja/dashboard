import { TestBed } from '@angular/core/testing';
import { DashboardLayoutService } from '../../../app/services/dashboard-layout.service';

describe('DashboardLayoutService', () => {
  let service: DashboardLayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardLayoutService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get current layout', () => {
    const layout = service.getCurrentLayout();
    expect(layout).toBeDefined();
    expect(layout.widgets).toBeDefined();
  });

  it('should toggle widget visibility', () => {
    const layout = service.getCurrentLayout();
    const widget = layout.widgets[0];
    const initialVisibility = widget.visible;
    
    service.toggleWidgetVisibility(widget.id);
    
    const updatedLayout = service.getCurrentLayout();
    const updatedWidget = updatedLayout.widgets.find(w => w.id === widget.id);
    expect(updatedWidget?.visible).toBe(!initialVisibility);
  });

  it('should reset to default', () => {
    service.resetToDefault();
    const layout = service.getCurrentLayout();
    expect(layout.name).toBe('Default');
  });
});

