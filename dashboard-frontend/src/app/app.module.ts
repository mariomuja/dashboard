import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BOOTSTRAP_CONFIG, BootstrapConfig, DOCUMENTATION_CONFIG, DocumentationConfig } from '@shared-components/services';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart.component';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { ConversionChartComponent } from './components/conversion-chart/conversion-chart.component';
import { AdminComponent } from './components/admin/admin.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { LoadingSkeletonComponent } from './components/loading-skeleton/loading-skeleton.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { GoalTrackerComponent } from './components/goal-tracker/goal-tracker.component';
import { DateRangePickerComponent } from './components/date-range-picker/date-range-picker.component';
import { InsightsPanelComponent } from './components/insights-panel/insights-panel.component';
import { TwoFactorSetupComponent } from './components/two-factor-setup/two-factor-setup.component';
import { ChartDetailModalComponent } from './components/chart-detail-modal/chart-detail-modal.component';
import { DashboardBuilderComponent } from './components/dashboard-builder/dashboard-builder.component';
import { EmailSchedulerComponent } from './components/email-scheduler/email-scheduler.component';
import { OAuthLoginComponent } from './components/oauth-login/oauth-login.component';
import { OrganizationSelectorComponent } from './components/organization-selector/organization-selector.component';
import { BrandingSettingsComponent } from './components/branding-settings/branding-settings.component';
import { CommentsPanelComponent } from './components/comments-panel/comments-panel.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { EnterpriseLoginComponent } from './components/enterprise-login/enterprise-login.component';
import { DashboardVersionHistoryComponent } from './components/dashboard-version-history/dashboard-version-history.component';
import { DataSourcesComponent } from './components/data-sources/data-sources.component';
import { EtlJobsComponent } from './components/etl-jobs/etl-jobs.component';
import { AdvancedAnalyticsComponent } from './components/advanced-analytics/advanced-analytics.component';
import { AuditTrailComponent } from './components/audit-trail/audit-trail.component';
import { TenantManagementComponent } from './components/tenant-management/tenant-management.component';
import { TempAccessComponent } from './components/temp-access/temp-access.component';
import { FormulaBuilderComponent } from './components/formula-builder/formula-builder.component';
import { DocumentationViewerComponent } from './components/documentation-viewer/documentation-viewer.component';
import { KpiEditorComponent } from './components/kpi-editor/kpi-editor.component';
import { ChartEditorComponent } from './components/chart-editor/chart-editor.component';
import { GoalEditorComponent } from './components/goal-editor/goal-editor.component';
import { InsightsEditorComponent } from './components/insights-editor/insights-editor.component';
import { ExternalKpisComponent } from './components/external-kpis/external-kpis.component';
import { CountUpDirective } from './directives/count-up.directive';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    KpiCardComponent,
    RevenueChartComponent,
    SalesChartComponent,
    ConversionChartComponent,
    AdminComponent,
    ThemeToggleComponent,
    LoadingSkeletonComponent,
    PieChartComponent,
    GoalTrackerComponent,
    DateRangePickerComponent,
    InsightsPanelComponent,
    TwoFactorSetupComponent,
    ChartDetailModalComponent,
    DashboardBuilderComponent,
    DashboardVersionHistoryComponent,
    DataSourcesComponent,
    EtlJobsComponent,
    AdvancedAnalyticsComponent,
    AuditTrailComponent,
    TenantManagementComponent,
    TempAccessComponent,
    FormulaBuilderComponent,
    EmailSchedulerComponent,
    OAuthLoginComponent,
    OrganizationSelectorComponent,
    BrandingSettingsComponent,
    CommentsPanelComponent,
    UserManagementComponent,
    EnterpriseLoginComponent,
    DocumentationViewerComponent,
    KpiEditorComponent,
    ChartEditorComponent,
    GoalEditorComponent,
    InsightsEditorComponent,
    CountUpDirective,
    ExternalKpisComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgChartsModule,
    DragDropModule
  ],
  providers: [
    {
      provide: BOOTSTRAP_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl || '/api',
        timeoutMs: 10000,
        apiEndpoint: '/data/dashboard-data',
        authTokenKey: 'sessionId',
        emailNotification: {
          enabled: true,
          recipientEmail: 'mario.muja@gmail.com',
          appName: 'KPI Dashboard',
          emailEndpoint: '/notify/bootstrap-error'
        },
        checkDatabase: true,
        validateSession: true,
        checkPerformance: true,
        performanceThresholdMs: 2000,
        criticalEndpoints: [
          '/data/dashboard-data',
          '/kpis/external'
        ],
        externalIntegrations: [
          {
            name: 'Bookkeeping App Integration',
            endpoint: 'https://international-bookkeeping.vercel.app/api/health',
            method: 'GET'
          }
        ],
        errorMessages: {
          backendNotResponding: 'Backend server is not responding',
          backendHealthFailed: 'Backend health check failed',
          apiEndpointsFailed: 'Failed to reach critical API endpoints',
          databaseOffline: 'Neon database connection failed',
          sessionInvalid: 'Session expired or invalid',
          performanceSlow: 'API response time is slow (Vercel cold start)',
          externalIntegrationFailed: 'External integrations unavailable'
        },
        successMessages: {
          backendConnected: 'Vercel Serverless Functions online',
          backendHealthy: 'Backend healthy - Dashboard API running',
          apiEndpoints: 'All serverless functions responding',
          authenticated: 'User authenticated with session',
          databaseConnected: 'Neon PostgreSQL connected',
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
          { filename: 'ADVANCED-ANALYTICS-GUIDE.md', title: 'Advanced Analytics Guide', path: 'docs/ADVANCED-ANALYTICS-GUIDE.md', category: 'Advanced Features', order: 1 },
          { filename: 'ADVANCED-FEATURES-SUMMARY.md', title: 'Advanced Features Summary', path: 'docs/ADVANCED-FEATURES-SUMMARY.md', category: 'Reference', order: 2 },
          { filename: 'CALCULATED-METRICS-GUIDE.md', title: 'Calculated Metrics Guide', path: 'docs/CALCULATED-METRICS-GUIDE.md', category: 'Features', order: 3 },
          { filename: 'COMPLETE-FEATURES-LIST.md', title: 'Complete Features List', path: 'docs/COMPLETE-FEATURES-LIST.md', category: 'Reference', order: 4 },
          { filename: 'DASHBOARD-BUILDER-GUIDE.md', title: 'Dashboard Builder Guide', path: 'docs/DASHBOARD-BUILDER-GUIDE.md', category: 'Features', order: 5 },
          { filename: 'DASHBOARD-VERSION-CONTROL-GUIDE.md', title: 'Dashboard Version Control Guide', path: 'docs/DASHBOARD-VERSION-CONTROL-GUIDE.md', category: 'Features', order: 6 },
          { filename: 'EMAIL-SETUP.md', title: 'Email Setup', path: 'docs/EMAIL-SETUP.md', category: 'Configuration', order: 7 },
          { filename: 'ENTERPRISE-FEATURES.md', title: 'Enterprise Features', path: 'docs/ENTERPRISE-FEATURES.md', category: 'Enterprise', order: 8 },
          { filename: 'ENTERPRISE-IDENTITY-GUIDE.md', title: 'Enterprise Identity Guide', path: 'docs/ENTERPRISE-IDENTITY-GUIDE.md', category: 'Enterprise', order: 9 },
          { filename: 'ETL-PIPELINE-GUIDE.md', title: 'ETL Pipeline Guide', path: 'docs/ETL-PIPELINE-GUIDE.md', category: 'Advanced Features', order: 10 },
          { filename: 'FEATURE-SUMMARY.md', title: 'Feature Summary', path: 'docs/FEATURE-SUMMARY.md', category: 'Reference', order: 11 },
          { filename: 'FILE-UPLOAD-GUIDE.md', title: 'File Upload Guide', path: 'docs/FILE-UPLOAD-GUIDE.md', category: 'Features', order: 12 },
          { filename: 'MULTI-TENANCY-GUIDE.md', title: 'Multi-Tenancy Guide', path: 'docs/MULTI-TENANCY-GUIDE.md', category: 'Enterprise', order: 13 },
          { filename: 'MULTIPLE-DATA-SOURCES-GUIDE.md', title: 'Multiple Data Sources Guide', path: 'docs/MULTIPLE-DATA-SOURCES-GUIDE.md', category: 'Advanced Features', order: 14 },
          { filename: 'OAUTH-SETUP.md', title: 'OAuth Setup', path: 'docs/OAUTH-SETUP.md', category: 'Configuration', order: 15 },
          { filename: 'SCHEDULED-REPORTS-BRANDING-GUIDE.md', title: 'Scheduled Reports & Branding Guide', path: 'docs/SCHEDULED-REPORTS-BRANDING-GUIDE.md', category: 'Features', order: 16 }
        ]
      } as DocumentationConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

