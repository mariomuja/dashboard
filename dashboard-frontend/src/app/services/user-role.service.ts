import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock user database
  private users: User[] = [
    { id: '1', username: 'admin', role: 'admin', email: 'admin@dashboard.com' },
    { id: '2', username: 'editor', role: 'editor', email: 'editor@dashboard.com' },
    { id: '3', username: 'viewer', role: 'viewer', email: 'viewer@dashboard.com' }
  ];

  constructor() {
    // Load from localStorage if available
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  setUser(username: string): boolean {
    const user = this.users.find(u => u.username === username);
    if (user) {
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentRole() === role;
  }

  canEdit(): boolean {
    const role = this.getCurrentRole();
    return role === 'admin' || role === 'editor';
  }

  canDelete(): boolean {
    return this.hasRole('admin');
  }

  canViewAdmin(): boolean {
    return this.hasRole('admin');
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }
}

