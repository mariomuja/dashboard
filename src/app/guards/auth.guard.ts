import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Store the attempted URL for redirecting after login
    sessionStorage.setItem('redirect_url', window.location.pathname);
    this.router.navigate(['/login']);
    return false;
  }
}

