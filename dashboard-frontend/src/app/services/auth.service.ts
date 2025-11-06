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

  // Updated login to call backend API and create isolated session
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { username, password }).pipe(
      tap((response: any) => {
        if (response.success && response.sessionId) {
          // Store session ID for API calls
          localStorage.setItem('sessionId', response.sessionId);
          localStorage.setItem('user', JSON.stringify(response.user));
          sessionStorage.setItem('admin_authenticated', 'true');
          this.isAuthenticatedSubject.next(true);
          console.log('[Auth] Session created:', response.sessionId);
        }
      }),
      catchError(error => {
        console.error('[Auth] Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const sessionId = localStorage.getItem('sessionId');
    
    if (sessionId) {
      // Call backend to cleanup session
      const headers = { 'x-session-id': sessionId };
      this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers }).subscribe({
        next: () => console.log('[Auth] Session cleaned up'),
        error: (err) => console.error('[Auth] Logout error:', err)
      });
    }

    // Clear local storage
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    sessionStorage.removeItem('admin_authenticated');
    this.isAuthenticatedSubject.next(false);
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

