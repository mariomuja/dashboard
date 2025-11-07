import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserManagementService, User, UserInvitation } from '../../services/user-management.service';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  invitations: UserInvitation[] = [];
  showInviteForm = false;
  showUserForm = false;
  selectedUser: User | null = null;
  
  inviteEmail = '';
  inviteRole: 'admin' | 'editor' | 'viewer' = 'viewer';
  
  userStats: any = {};
  currentOrgId = '';

  constructor(
    private userService: UserManagementService,
    private orgService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const org = this.orgService.getCurrentOrganization();
    this.currentOrgId = org?.id || 'org-1';
    this.loadData();
  }

  loadData(): void {
    this.users = this.userService.getUsersByOrganization(this.currentOrgId);
    this.invitations = this.userService.getPendingInvitations().filter(
      i => i.organizationId === this.currentOrgId
    );
    this.userStats = this.userService.getUserStats(this.currentOrgId);
  }

  toggleInviteForm(): void {
    this.showInviteForm = !this.showInviteForm;
    if (!this.showInviteForm) {
      this.inviteEmail = '';
      this.inviteRole = 'viewer';
    }
  }

  sendInvitation(): void {
    if (!this.inviteEmail || !this.isValidEmail(this.inviteEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    const invitation = this.userService.createInvitation(
      this.inviteEmail,
      this.inviteRole,
      this.currentOrgId
    );

    alert(`Invitation sent to ${this.inviteEmail}\n\nInvitation link:\nhttp://localhost:4200/accept-invite?token=${invitation.token}`);
    
    this.loadData();
    this.toggleInviteForm();
  }

  cancelInvitation(invitationId: string): void {
    if (confirm('Cancel this invitation?')) {
      this.userService.cancelInvitation(invitationId);
      this.loadData();
    }
  }

  resendInvitation(invitationId: string): void {
    if (this.userService.resendInvitation(invitationId)) {
      alert('Invitation resent!');
    }
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    this.showUserForm = true;
  }

  saveUser(): void {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser.id, this.selectedUser);
      this.showUserForm = false;
      this.selectedUser = null;
      this.loadData();
      alert('User updated successfully!');
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Delete this user? This action cannot be undone.')) {
      this.userService.deleteUser(userId);
      this.loadData();
    }
  }

  toggleUserStatus(user: User): void {
    if (user.status === 'active') {
      this.userService.deactivateUser(user.id);
    } else {
      this.userService.activateUser(user.id);
    }
    this.loadData();
  }

  changeUserRole(userId: string, role: 'admin' | 'editor' | 'viewer'): void {
    if (confirm(`Change user role to ${role}?`)) {
      this.userService.updateUserRole(userId, role);
      this.loadData();
    }
  }

  getRoleBadgeClass(role: string): string {
    return `role-badge role-${role}`;
  }

  getStatusBadgeClass(status: string): string {
    return `status-badge status-${status}`;
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

