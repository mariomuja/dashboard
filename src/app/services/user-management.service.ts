import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  organizationId: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
  permissions: UserPermissions;
  invitedBy?: string;
}

export interface UserPermissions {
  canViewDashboards: boolean;
  canEditDashboards: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canAccessAdmin: boolean;
  canScheduleReports: boolean;
  canViewComments: boolean;
  canAddComments: boolean;
  canDeleteComments: boolean;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  organizationId: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly USERS_KEY = 'dashboard_users';
  private readonly INVITATIONS_KEY = 'dashboard_invitations';
  private readonly CURRENT_USER_KEY = 'current_user';
  
  private usersSubject: BehaviorSubject<User[]>;
  private invitationsSubject: BehaviorSubject<UserInvitation[]>;
  private currentUserSubject: BehaviorSubject<User | null>;
  
  public users$: Observable<User[]>;
  public invitations$: Observable<UserInvitation[]>;
  public currentUser$: Observable<User | null>;

  constructor() {
    this.usersSubject = new BehaviorSubject<User[]>(this.loadUsers());
    this.invitationsSubject = new BehaviorSubject<UserInvitation[]>(this.loadInvitations());
    this.currentUserSubject = new BehaviorSubject<User | null>(this.loadCurrentUser());
    
    this.users$ = this.usersSubject.asObservable();
    this.invitations$ = this.invitationsSubject.asObservable();
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // User Management
  getUsers(): User[] {
    return this.usersSubject.value;
  }

  getUserById(userId: string): User | undefined {
    return this.getUsers().find(u => u.id === userId);
  }

  getUsersByOrganization(orgId: string): User[] {
    return this.getUsers().filter(u => u.organizationId === orgId);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'status'>): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      status: 'active',
      createdAt: new Date()
    };

    const users = [...this.getUsers(), newUser];
    this.saveUsers(users);
    return newUser;
  }

  updateUser(userId: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      Object.assign(user, updates);
      this.saveUsers(users);
      return true;
    }
    return false;
  }

  deleteUser(userId: string): boolean {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.saveUsers(users);
    return true;
  }

  updateUserRole(userId: string, role: 'admin' | 'editor' | 'viewer'): boolean {
    const permissions = this.getRolePermissions(role);
    return this.updateUser(userId, { role, permissions });
  }

  deactivateUser(userId: string): boolean {
    return this.updateUser(userId, { status: 'inactive' });
  }

  activateUser(userId: string): boolean {
    return this.updateUser(userId, { status: 'active' });
  }

  // Current User
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Permissions
  hasPermission(permission: keyof UserPermissions): boolean {
    const user = this.getCurrentUser();
    return user ? user.permissions[permission] : false;
  }

  getRolePermissions(role: 'admin' | 'editor' | 'viewer'): UserPermissions {
    const basePermissions: UserPermissions = {
      canViewDashboards: true,
      canEditDashboards: false,
      canExportData: false,
      canManageUsers: false,
      canManageSettings: false,
      canAccessAdmin: false,
      canScheduleReports: false,
      canViewComments: true,
      canAddComments: false,
      canDeleteComments: false
    };

    switch (role) {
      case 'admin':
        return {
          canViewDashboards: true,
          canEditDashboards: true,
          canExportData: true,
          canManageUsers: true,
          canManageSettings: true,
          canAccessAdmin: true,
          canScheduleReports: true,
          canViewComments: true,
          canAddComments: true,
          canDeleteComments: true
        };
      
      case 'editor':
        return {
          ...basePermissions,
          canEditDashboards: true,
          canExportData: true,
          canScheduleReports: true,
          canAddComments: true
        };
      
      case 'viewer':
        return basePermissions;
      
      default:
        return basePermissions;
    }
  }

  // Invitations
  getInvitations(): UserInvitation[] {
    return this.invitationsSubject.value;
  }

  getPendingInvitations(): UserInvitation[] {
    return this.getInvitations().filter(i => i.status === 'pending');
  }

  createInvitation(email: string, role: 'admin' | 'editor' | 'viewer', organizationId: string): UserInvitation {
    const invitation: UserInvitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      organizationId,
      invitedBy: this.getCurrentUser()?.id || 'system',
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
      token: this.generateInvitationToken()
    };

    const invitations = [...this.getInvitations(), invitation];
    this.saveInvitations(invitations);
    return invitation;
  }

  acceptInvitation(token: string, userData: Partial<User>): User | null {
    const invitations = this.getInvitations();
    const invitation = invitations.find(i => i.token === token && i.status === 'pending');
    
    if (!invitation) return null;
    
    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      this.saveInvitations(invitations);
      return null;
    }

    const newUser = this.createUser({
      email: invitation.email,
      name: userData.name || invitation.email.split('@')[0],
      role: invitation.role,
      organizationId: invitation.organizationId,
      avatar: userData.avatar,
      permissions: this.getRolePermissions(invitation.role),
      invitedBy: invitation.invitedBy
    });

    invitation.status = 'accepted';
    this.saveInvitations(invitations);
    
    return newUser;
  }

  cancelInvitation(invitationId: string): boolean {
    const invitations = this.getInvitations().filter(i => i.id !== invitationId);
    this.saveInvitations(invitations);
    return true;
  }

  resendInvitation(invitationId: string): boolean {
    const invitation = this.getInvitations().find(i => i.id === invitationId);
    if (invitation && invitation.status === 'pending') {
      invitation.invitedAt = new Date();
      invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      this.saveInvitations(this.getInvitations());
      return true;
    }
    return false;
  }

  private generateInvitationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Statistics
  getUserStats(organizationId?: string): any {
    let users = this.getUsers();
    if (organizationId) {
      users = users.filter(u => u.organizationId === organizationId);
    }

    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      pending: users.filter(u => u.status === 'pending').length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        editor: users.filter(u => u.role === 'editor').length,
        viewer: users.filter(u => u.role === 'viewer').length
      }
    };
  }

  // Storage
  private loadUsers(): User[] {
    const saved = localStorage.getItem(this.USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined
      }));
    }
    
    // Default admin user
    return [{
      id: 'user-admin',
      email: 'admin@dashboard.com',
      name: 'Administrator',
      role: 'admin',
      organizationId: 'org-1',
      status: 'active',
      createdAt: new Date(),
      permissions: this.getRolePermissions('admin')
    }];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    this.usersSubject.next(users);
  }

  private loadInvitations(): UserInvitation[] {
    const saved = localStorage.getItem(this.INVITATIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((i: any) => ({
        ...i,
        invitedAt: new Date(i.invitedAt),
        expiresAt: new Date(i.expiresAt)
      }));
    }
    return [];
  }

  private saveInvitations(invitations: UserInvitation[]): void {
    localStorage.setItem(this.INVITATIONS_KEY, JSON.stringify(invitations));
    this.invitationsSubject.next(invitations);
  }

  private loadCurrentUser(): User | null {
    const saved = localStorage.getItem(this.CURRENT_USER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : undefined
      };
    }
    return null;
  }
}

