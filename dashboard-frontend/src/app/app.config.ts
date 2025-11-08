import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BootstrapConfig, BOOTSTRAP_CONFIG, DocumentationConfig, DOCUMENTATION_CONFIG } from '@mariomuja/angular-shared-components';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    {
      provide: BOOTSTRAP_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl || '/api',
        timeoutMs: 5000,
        apiEndpoint: '/health',
        authTokenKey: 'sessionId',
        emailNotification: {
          enabled: true,
          recipientEmail: 'mario.muja@gmail.com',
          appName: 'International KPI Dashboard',
          emailEndpoint: '/notify/bootstrap-error'
        },
        checkDatabase: true,
        validateSession: true,
        checkPerformance: true,
        performanceThresholdMs: 1000,
        criticalEndpoints: [
          '/health',
          '/data/dashboard-data'
        ],
        externalIntegrations: [
          {
            name: 'Bookkeeping Integration',
            endpoint: 'https://international-bookkeeping.vercel.app/api/health',
            method: 'GET'
          }
        ],
        errorMessages: {
          backendNotResponding: 'Backend server is not responding',
          backendHealthFailed: 'Backend health check failed',
          apiEndpointsFailed: 'Failed to reach critical API endpoints',
          databaseOffline: 'Database connection failed',
          sessionInvalid: 'Session expired or invalid',
          performanceSlow: 'API response time is slow',
          externalIntegrationFailed: 'External integrations unavailable'
        },
        successMessages: {
          backendConnected: 'Backend online',
          backendHealthy: 'Backend healthy',
          apiEndpoints: 'All endpoints responding',
          authenticated: 'User authenticated',
          databaseConnected: 'Database connected',
          sessionValid: 'Session valid',
          performanceGood: 'Performance optimal',
          externalIntegrationOk: 'Cross-app integrations available'
        }
      } as BootstrapConfig
    },
    {
      provide: DOCUMENTATION_CONFIG,
      useValue: {
        docsBasePath: '/docs',
        files: [
          { filename: 'QUICK_START.md', title: 'Quick Start Guide', path: '/docs/QUICK_START.md', category: 'Getting Started', order: 1 },
          { filename: 'SETUP.md', title: 'Setup Instructions', path: '/docs/SETUP.md', category: 'Getting Started', order: 2 },
          { filename: 'FEATURES.md', title: 'Features Overview', path: '/docs/FEATURES.md', category: 'User Guide', order: 3 },
          { filename: 'API.md', title: 'API Documentation', path: '/docs/API.md', category: 'Technical', order: 4 },
          { filename: 'TROUBLESHOOTING.md', title: 'Troubleshooting', path: '/docs/TROUBLESHOOTING.md', category: 'Support', order: 5 }
        ]
      } as DocumentationConfig
    }
  ]
};



