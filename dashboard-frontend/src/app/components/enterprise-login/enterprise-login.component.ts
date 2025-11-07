import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enterprise-login',
  templateUrl: './enterprise-login.component.html',
  styleUrls: ['./enterprise-login.component.css']
})
export class EnterpriseLoginComponent {
  private ldapUrl = 'http://localhost:3004';
  private samlUrl = 'http://localhost:3006';
  
  // LDAP/AD login
  ldapUsername = '';
  ldapPassword = '';
  ldapDomain = '';
  isLdapLoading = false;
  
  // SCIM info
  scimEndpoint = 'http://localhost:3005/scim/v2';
  scimToken = 'scim-bearer-token-change-in-production';
  
  selectedAuthMethod: 'ldap' | 'ad' | 'saml' | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  selectAuthMethod(method: 'ldap' | 'ad' | 'saml'): void {
    this.selectedAuthMethod = method;
  }

  loginWithLDAP(): void {
    if (!this.ldapUsername || !this.ldapPassword) {
      alert('Please enter username and password');
      return;
    }

    this.isLdapLoading = true;

    this.http.post(`${this.ldapUrl}/auth/ldap`, {
      username: this.ldapUsername,
      password: this.ldapPassword
    }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        alert('LDAP login successful!');
        this.router.navigate(['/']);
        this.isLdapLoading = false;
      },
      error: (error) => {
        alert('LDAP login failed: ' + (error.error?.detail || error.message));
        console.error('LDAP error:', error);
        this.isLdapLoading = false;
      }
    });
  }

  loginWithAD(): void {
    if (!this.ldapUsername || !this.ldapPassword) {
      alert('Please enter username and password');
      return;
    }

    this.isLdapLoading = true;

    const username = this.ldapDomain 
      ? `${this.ldapDomain}\\${this.ldapUsername}`
      : this.ldapUsername;

    this.http.post(`${this.ldapUrl}/auth/ad`, {
      username: username,
      password: this.ldapPassword
    }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        alert('Active Directory login successful!');
        this.router.navigate(['/']);
        this.isLdapLoading = false;
      },
      error: (error) => {
        alert('AD login failed: ' + (error.error?.detail || error.message));
        console.error('AD error:', error);
        this.isLdapLoading = false;
      }
    });
  }

  loginWithSAML(): void {
    // Redirect to SAML SSO endpoint
    window.location.href = `${this.samlUrl}/auth/saml`;
  }

  copySCIMEndpoint(): void {
    navigator.clipboard.writeText(this.scimEndpoint);
    alert('SCIM endpoint copied to clipboard!');
  }

  copySCIMToken(): void {
    navigator.clipboard.writeText(this.scimToken);
    alert('SCIM token copied to clipboard!');
  }

  goToOAuthLogin(): void {
    this.router.navigate(['/oauth-login']);
  }

  goToPasswordLogin(): void {
    this.router.navigate(['/login']);
  }
}


