import { Component } from '@angular/core';
import { SharedStartupShellComponent, StartupConfig } from '@mario-muja/angular-shared-components';

@Component({
  selector: 'app-startup',
  standalone: true,
  imports: [SharedStartupShellComponent],
  template: `<shared-startup-shell 
    [config]="startupConfig" 
    [redirectAfterSuccess]="'/dashboard'"
    [redirectAfterError]="'/login'"
    [authTokenKey]="'sessionId'">
  </shared-startup-shell>`
})
export class StartupComponent {
  startupConfig: StartupConfig = {
    appName: 'KPI Dashboard',
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>`,
    versionText: 'KPI Dashboard v1.0.0 | Mario Muja',
    retryLabel: 'Retry Connection',
    instructionsLabel: 'View on GitHub',
    instructionsUrl: 'https://github.com/mariomuja/dashboard',
    initializingSubtitle: 'Starting application...',
    helpSteps: [
      '<strong>Vercel Serverless:</strong> Backend may be initializing. Wait a few seconds and click "Retry Connection"',
      'Check that backend is accessible at: <code>https://international-kpi-dashboard.vercel.app/api/health</code>',
      'Verify backend health endpoint is responding',
      'Check browser console for additional error details'
    ]
  };
}

