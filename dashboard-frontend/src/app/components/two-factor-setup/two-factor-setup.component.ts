import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TwoFactorAuthService, TwoFactorSetup } from '../../services/two-factor-auth.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './two-factor-setup.component.html',
  styleUrls: ['./two-factor-setup.component.css']
})
export class TwoFactorSetupComponent implements OnInit {
  twoFactorSetup: TwoFactorSetup | null = null;
  verificationCode: string = '';
  isVerifying = false;
  showBackupCodes = false;
  username: string = '';
  is2FAEnabled = false;

  constructor(
    private twoFactorService: TwoFactorAuthService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Get current username (in real app, from auth service)
    this.username = 'admin'; // Hardcoded for demo
    this.is2FAEnabled = this.twoFactorService.is2FAEnabled(this.username);
  }

  async setupTwoFactor() {
    this.twoFactorSetup = await this.twoFactorService.generateSecret(this.username);
  }

  verifyAndEnable() {
    if (!this.twoFactorSetup || !this.verificationCode) {
      alert('Please enter the verification code');
      return;
    }

    this.isVerifying = true;

    const isValid = this.twoFactorService.verifyToken(
      this.twoFactorSetup.secret,
      this.verificationCode
    );

    if (isValid) {
      // Store secret and enable 2FA
      this.twoFactorService.storeSecret(this.username, this.twoFactorSetup.secret);
      this.twoFactorService.storeBackupCodes(this.username, this.twoFactorSetup.backupCodes);
      this.twoFactorService.enable2FA(this.username);
      
      this.is2FAEnabled = true;
      this.showBackupCodes = true;
      alert('Two-Factor Authentication enabled successfully!');
    } else {
      alert('Invalid verification code. Please try again.');
    }

    this.isVerifying = false;
  }

  disable2FA() {
    if (confirm('Are you sure you want to disable Two-Factor Authentication?')) {
      this.twoFactorService.disable2FA(this.username);
      this.is2FAEnabled = false;
      this.twoFactorSetup = null;
      this.verificationCode = '';
      this.showBackupCodes = false;
      alert('Two-Factor Authentication disabled');
    }
  }

  downloadBackupCodes() {
    if (!this.twoFactorSetup) return;

    const content = `KPI Dashboard - Backup Codes\n\nUsername: ${this.username}\nGenerated: ${new Date().toLocaleString()}\n\n${this.twoFactorSetup.backupCodes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-codes.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}

