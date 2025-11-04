import { TestBed } from '@angular/core/testing';
import { UserManagementService } from '../../../app/services/user-management.service';

describe('UserManagementService', () => {
  let service: UserManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserManagementService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create user', () => {
    const user = service.createUser({
      email: 'test@example.com',
      name: 'Test User',
      role: 'viewer',
      organizationId: 'org-1',
      permissions: service.getRolePermissions('viewer')
    });
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('should get users by organization', () => {
    service.createUser({
      email: 'test1@example.com',
      name: 'User 1',
      role: 'viewer',
      organizationId: 'org-1',
      permissions: service.getRolePermissions('viewer')
    });
    const users = service.getUsersByOrganization('org-1');
    expect(users.length).toBeGreaterThan(0);
  });

  it('should create invitation', () => {
    const invitation = service.createInvitation('test@example.com', 'viewer', 'org-1');
    expect(invitation).toBeDefined();
    expect(invitation.email).toBe('test@example.com');
  });

  it('should get role permissions', () => {
    const adminPerms = service.getRolePermissions('admin');
    expect(adminPerms.canManageUsers).toBe(true);
    
    const viewerPerms = service.getRolePermissions('viewer');
    expect(viewerPerms.canManageUsers).toBe(false);
  });
});

