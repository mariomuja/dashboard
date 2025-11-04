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
      // Get the stored redirect URL
      let redirectUrl = sessionStorage.getItem('redirect_url') || '/admin';
      sessionStorage.removeItem('redirect_url');
      
      // If redirect URL is the public dashboard homepage, go to admin instead
      // This ensures admin login always goes to admin page, not back to homepage
      if (redirectUrl === '/' || redirectUrl === '') {
        redirectUrl = '/admin';
      }
      
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

