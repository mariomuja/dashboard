import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../../../app/services/theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle theme', () => {
    const initialTheme = service.getCurrentTheme();
    service.toggleTheme();
    expect(service.getCurrentTheme()).not.toBe(initialTheme);
  });

  it('should set theme', () => {
    service.setTheme('dark');
    expect(service.getCurrentTheme()).toBe('dark');
  });

  it('should persist theme to localStorage', () => {
    service.setTheme('dark');
    expect(localStorage.getItem('dashboard_theme')).toBe('dark');
  });
});

