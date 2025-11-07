import { createAuthGuard } from '@shared-components/auth';

export const authGuard = createAuthGuard({
  tokenKey: 'sessionId',
  redirectTo: '/login',
  rememberAttemptedUrl: true,
  attemptedUrlKey: 'redirect_url'
});

