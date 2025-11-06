import { Component } from '@angular/core';
import { SharedLoginComponent } from '../shared-login/login.component';
import { LoginConfig } from '../shared-login/login-config.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedLoginComponent],
  template: `<shared-login [config]="loginConfig" [authService]="authService"></shared-login>`
})
export class LoginComponent {
  loginConfig: LoginConfig = {
    appTitle: 'KPI Dashboard',
    redirectAfterLogin: '/dashboard',
    showDeveloperCard: true,
    photoUrl: 'assets/images/mario-muja.jpg',
    githubRepoUrl: 'https://github.com/mariomuja/dashboard',
    demoCredentials: {
      username: 'demo',
      password: 'DemoKPI2025!Secure'
    }
  };

  constructor(
    public authService: AuthService
  ) {}
}
