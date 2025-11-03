import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthentication());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // In production, this should be validated against a backend
  // For development, using a simple password stored in environment
  private readonly adminPassword = 'admin123'; // Change this in production!

  constructor() { }

  login(password: string): boolean {
    if (password === this.adminPassword) {
      sessionStorage.setItem('admin_authenticated', 'true');
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem('admin_authenticated');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.checkAuthentication();
  }

  private checkAuthentication(): boolean {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  }
}

