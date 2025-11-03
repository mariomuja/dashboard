import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';
import * as OTPAuth from 'otpauth';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TwoFactorAuthService {
  
  // Generate 2FA secret and QR code
  async generateSecret(username: string, issuer: string = 'KPI Dashboard'): Promise<TwoFactorSetup> {
    // Generate random secret
    const secret = this.generateRandomSecret();
    
    // Create TOTP object
    const totp = new OTPAuth.TOTP({
      issuer: issuer,
      label: username,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret)
    });

    const qrCode = await QRCode.toDataURL(totp.toString());
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret,
      qrCode: qrCode,
      backupCodes: backupCodes
    };
  }

  // Verify TOTP token
  verifyToken(secret: string, token: string): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });

      // Validate the token (with 1-step window for time drift)
      const delta = totp.validate({ token: token, window: 1 });
      return delta !== null;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  private generateRandomSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Base32 chars
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  // Generate backup codes
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Verify backup code
  verifyBackupCode(storedCodes: string[], providedCode: string): boolean {
    const index = storedCodes.indexOf(providedCode.toUpperCase());
    if (index > -1) {
      // Remove used backup code
      storedCodes.splice(index, 1);
      return true;
    }
    return false;
  }

  // Enable 2FA for user
  enable2FA(username: string): void {
    localStorage.setItem(`2fa_enabled_${username}`, 'true');
  }

  // Disable 2FA for user
  disable2FA(username: string): void {
    localStorage.removeItem(`2fa_enabled_${username}`);
    localStorage.removeItem(`2fa_secret_${username}`);
    localStorage.removeItem(`2fa_backup_${username}`);
  }

  // Check if 2FA is enabled
  is2FAEnabled(username: string): boolean {
    return localStorage.getItem(`2fa_enabled_${username}`) === 'true';
  }

  // Store secret (in real app, this would be on backend)
  storeSecret(username: string, secret: string): void {
    localStorage.setItem(`2fa_secret_${username}`, secret);
  }

  // Get stored secret
  getSecret(username: string): string | null {
    return localStorage.getItem(`2fa_secret_${username}`);
  }

  // Store backup codes
  storeBackupCodes(username: string, codes: string[]): void {
    localStorage.setItem(`2fa_backup_${username}`, JSON.stringify(codes));
  }

  // Get backup codes
  getBackupCodes(username: string): string[] {
    const stored = localStorage.getItem(`2fa_backup_${username}`);
    return stored ? JSON.parse(stored) : [];
  }
}

