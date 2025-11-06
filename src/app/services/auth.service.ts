import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthentication());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // Demo credentials
  private readonly demoUsername = 'demo';
  private readonly demoPassword = 'DemoKPI2025!Secure';

  constructor() { }

  // Updated login to return Observable to work with shared component
  login(username: string, password: string): Observable<any> {
    if (username === this.demoUsername && password === this.demoPassword) {
      sessionStorage.setItem('admin_authenticated', 'true');
      this.isAuthenticatedSubject.next(true);
      return of({ 
        success: true,
        user: { username: this.demoUsername }
      });
    }
    return throwError(() => ({ error: { error: 'Invalid credentials' } }));
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

