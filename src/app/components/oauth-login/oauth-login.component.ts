import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-oauth-login',
  templateUrl: './oauth-login.component.html',
  styleUrls: ['./oauth-login.component.css']
})
export class OAuthLoginComponent implements OnInit {
  private oauthUrl = 'http://localhost:3003';
  oauthUser: any = null;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Check if OAuth callback
    this.route.queryParams.subscribe(params => {
      if (params['oauth'] === 'success') {
        this.checkAuthStatus();
      } else {
        this.isLoading = false;
      }
    });

    // Check current auth status
    this.checkAuthStatus();
  }

  loginWithGoogle(): void {
    window.location.href = `${this.oauthUrl}/auth/google`;
  }

  loginWithGitHub(): void {
    window.location.href = `${this.oauthUrl}/auth/github`;
  }

  checkAuthStatus(): void {
    this.http.get(`${this.oauthUrl}/api/auth/user`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.authenticated) {
          this.oauthUser = response.user;
          // Navigate to dashboard
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error checking auth status:', error);
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.http.post(`${this.oauthUrl}/api/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.oauthUser = null;
        alert('Logged out successfully');
      },
      error: (error) => {
        console.error('Error logging out:', error);
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/']);
  }
}

