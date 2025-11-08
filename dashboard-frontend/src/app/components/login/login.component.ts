import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedLoginComponent, LoginConfig } from '@mariomuja/angular-shared-components';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedLoginComponent],
  template: `<shared-login 
    [config]="loginConfig" 
    [authService]="authService"
    (loginSuccess)="handleLoginSuccess()"></shared-login>`
})
export class LoginComponent {
  loginConfig: LoginConfig = {
    appTitle: 'KPI Dashboard',
    redirectAfterLogin: '/dashboard',
    showDeveloperCard: true,
    photoUrl: 'assets/images/mario-muja.jpg',
    githubRepoUrl: 'https://github.com/mariomuja/dashboard',
    quickDemoMode: true,
    showProductionLogin: false,
    authenticationMethods: ['credentials', 'activeDirectory', 'google', 'microsoft', 'github'],
    demoCredentials: {
      username: 'demo',
      password: 'DemoKPI2025!Secure'
    }
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  handleLoginSuccess() {
    this.router.navigate([this.loginConfig.redirectAfterLogin || '/dashboard']);
  }
}
