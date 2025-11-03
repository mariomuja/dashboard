import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    // Clear session storage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for incorrect password', () => {
    const result = service.login('wrongpassword');
    expect(result).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should return true for correct password', () => {
    const result = service.login('admin123');
    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should set session storage on successful login', () => {
    service.login('admin123');
    expect(sessionStorage.getItem('admin_authenticated')).toBe('true');
  });

  it('should not set session storage on failed login', () => {
    service.login('wrongpassword');
    expect(sessionStorage.getItem('admin_authenticated')).toBeNull();
  });

  it('should clear authentication on logout', () => {
    service.login('admin123');
    expect(service.isAuthenticated()).toBe(true);
    
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('admin_authenticated')).toBeNull();
  });

  it('should emit authentication state changes', (done) => {
    service.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        expect(isAuth).toBe(true);
        done();
      }
    });

    service.login('admin123');
  });
});

