import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthentication());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // Demo credentials
  private readonly demoUsername = 'demo';
  private readonly demoPassword = 'DemoKPI2025!Secure';

  constructor(private http: HttpClient) { }

  // Auto-login without credentials - everyone can access the dashboard
  login(username: string, password: string): Observable<any> {
    // Auto-authenticate without backend validation
    const sessionId = 'demo-session-' + Date.now();
    const user = {
      id: 'demo-user',
      username: username || 'demo',
      name: 'Demo User',
      email: 'demo@kpidashboard.com',
      role: 'admin'
    };

    // Store session locally
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('admin_authenticated', 'true');
    this.isAuthenticatedSubject.next(true);
    
    console.log('[Auth] Auto-authenticated user:', username);
    
    // Return successful response immediately
    return of({
      success: true,
      sessionId: sessionId,
      user: user
    });
  }

  logout(): void {
    // Clear local storage
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    sessionStorage.removeItem('admin_authenticated');
    this.isAuthenticatedSubject.next(false);
    console.log('[Auth] User logged out');
  }

  isAuthenticated(): boolean {
    return this.checkAuthentication();
  }

  private checkAuthentication(): boolean {
    return sessionStorage.getItem('admin_authenticated') === 'true' && 
           !!localStorage.getItem('sessionId');
  }

  getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }

  getUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

