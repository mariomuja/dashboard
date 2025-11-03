import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  password = '';
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.password) {
      this.errorMessage = 'Please enter a password';
      return;
    }

    const success = this.authService.login(this.password);
    
    if (success) {
      // Redirect to the attempted URL or admin page
      const redirectUrl = sessionStorage.getItem('redirect_url') || '/admin';
      sessionStorage.removeItem('redirect_url');
      this.router.navigate([redirectUrl]);
    } else {
      this.errorMessage = 'Invalid password. Please try again.';
      this.password = '';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

