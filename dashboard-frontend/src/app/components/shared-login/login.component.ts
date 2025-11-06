import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginConfig } from './login-config.interface';

// Note: AuthService and OrganizationService should be provided by the consuming app
@Component({
  selector: 'shared-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class SharedLoginComponent implements OnInit {
  @Input() config!: LoginConfig;
  @Input() authService: any; // Will be injected by consuming app
  @Input() organizationService?: any; // Optional, for bookkeeping app
  
  private router = inject(Router);
  
  username = '';
  password = '';
  twoFactorCode = '';
  tempToken = '';
  
  loading = false;
  error = '';
  requiresTwoFactor = false;
  showPassword = false;

  ngOnInit() {
    // If already authenticated, redirect to dashboard
    if (this.authService?.isAuthenticated()) {
      this.router.navigate([this.config?.redirectAfterLogin || '/dashboard']);
    }
  }

  async onLogin() {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        if (response.requiresTwoFactor) {
          this.requiresTwoFactor = true;
          this.tempToken = response.tempToken || '';
          this.loading = false;
        } else {
          // Login successful - set organization
          this.setOrganizationAndNavigate(response.user?.organizationId);
        }
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }

  async onVerify2FA() {
    if (!this.twoFactorCode) {
      this.error = 'Please enter the 2FA code';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verify2FA(this.tempToken, this.twoFactorCode).subscribe({
      next: (response: any) => {
        this.setOrganizationAndNavigate(response.user?.organizationId);
      },
      error: (err: any) => {
        this.error = err.error?.error || '2FA verification failed';
        this.loading = false;
      }
    });
  }

  setOrganizationAndNavigate(orgId?: string): void {
    // Set organization if organizationService is provided (bookkeeping app)
    if (this.organizationService) {
      const demoOrg = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Demo Company',
        countryCode: 'US',
        defaultCurrency: 'USD',
        defaultTimezone: 'America/New_York',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      this.organizationService.setCurrentOrganization(demoOrg);
    }
    
    // Navigate to configured redirect or default to /dashboard
    const redirectUrl = this.config?.redirectAfterLogin || '/dashboard';
    this.router.navigate([redirectUrl]);
  }

  cancelTwoFactor() {
    this.requiresTwoFactor = false;
    this.twoFactorCode = '';
    this.tempToken = '';
    this.error = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

