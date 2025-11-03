import { TestBed } from '@angular/core/testing';
import { TwoFactorAuthService } from './two-factor-auth.service';

describe('TwoFactorAuthService', () => {
  let service: TwoFactorAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TwoFactorAuthService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate secret', async () => {
    const setup = await service.generateSecret('testuser');
    expect(setup.secret).toBeDefined();
    expect(setup.secret.length).toBe(32);
    expect(setup.qrCode).toContain('data:image/png');
    expect(setup.backupCodes.length).toBe(10);
  });

  it('should enable and check 2FA status', () => {
    service.enable2FA('testuser');
    expect(service.is2FAEnabled('testuser')).toBe(true);
  });

  it('should disable 2FA', () => {
    service.enable2FA('testuser');
    service.disable2FA('testuser');
    expect(service.is2FAEnabled('testuser')).toBe(false);
  });

  it('should store and retrieve secret', () => {
    service.storeSecret('testuser', 'TESTSECRET123');
    expect(service.getSecret('testuser')).toBe('TESTSECRET123');
  });
});

