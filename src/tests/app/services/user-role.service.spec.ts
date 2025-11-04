import { TestBed } from '@angular/core/testing';
import { UserRoleService } from '../../../app/services/user-role.service';

describe('UserRoleService', () => {
  let service: UserRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRoleService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set user', () => {
    const result = service.setUser('admin');
    expect(result).toBe(true);
    expect(service.getCurrentUser()?.username).toBe('admin');
  });

  it('should check admin role', () => {
    service.setUser('admin');
    expect(service.hasRole('admin')).toBe(true);
    expect(service.canViewAdmin()).toBe(true);
  });

  it('should check editor permissions', () => {
    service.setUser('editor');
    expect(service.canEdit()).toBe(true);
    expect(service.canDelete()).toBe(false);
  });

  it('should check viewer permissions', () => {
    service.setUser('viewer');
    expect(service.canEdit()).toBe(false);
    expect(service.canViewAdmin()).toBe(false);
  });

  it('should logout user', () => {
    service.setUser('admin');
    service.logout();
    expect(service.getCurrentUser()).toBeNull();
  });
});

