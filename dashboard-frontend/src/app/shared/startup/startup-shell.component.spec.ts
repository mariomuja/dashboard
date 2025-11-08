import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SharedStartupShellComponent } from './startup-shell.component';
import { BootstrapService } from '../services/bootstrap.service';
import { of } from 'rxjs';

describe('SharedStartupShellComponent', () => {
  let component: SharedStartupShellComponent;
  let fixture: ComponentFixture<SharedStartupShellComponent>;
  let mockBootstrapService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockBootstrapService = {
      bootstrapState$: of({
        isReady: false,
        checks: [],
        overallStatus: 'initializing'
      }),
      runBootstrapChecks: jasmine.createSpy('runBootstrapChecks').and.returnValue(Promise.resolve(true)),
      reset: jasmine.createSpy('reset')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [SharedStartupShellComponent],
      providers: [
        { provide: BootstrapService, useValue: mockBootstrapService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedStartupShellComponent);
    component = fixture.componentInstance;
    component.config = {
      appName: 'Test App',
      versionText: 'v1.0.0'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run bootstrap checks on init', () => {
    expect(mockBootstrapService.runBootstrapChecks).toHaveBeenCalled();
  });

  it('should navigate to dashboard when authenticated', () => {
    spyOn(localStorage, 'getItem').and.returnValue('test-token');
    component.proceedToApp();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to login when not authenticated', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component.proceedToApp();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should retry bootstrap checks', async () => {
    await component.retry();
    expect(mockBootstrapService.reset).toHaveBeenCalled();
    expect(mockBootstrapService.runBootstrapChecks).toHaveBeenCalled();
  });

  it('should return correct status icons', () => {
    expect(component.getStatusIcon('success')).toBe('✓');
    expect(component.getStatusIcon('error')).toBe('✗');
    expect(component.getStatusIcon('warning')).toBe('⚠');
    expect(component.getStatusIcon('pending')).toBe('...');
  });

  it('should return correct status classes', () => {
    expect(component.getStatusClass('success')).toBe('status-success');
    expect(component.getStatusClass('error')).toBe('status-error');
  });

  it('should open instructions URL', () => {
    spyOn(window, 'open');
    component.config.instructionsUrl = 'https://example.com';
    component.openInstructions();
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
  });
});


