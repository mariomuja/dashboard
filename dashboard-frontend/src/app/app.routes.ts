import { Routes } from '@angular/router';
import { StartupSimpleComponent } from './components/startup/startup-simple.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { TwoFactorSetupComponent } from './components/two-factor-setup/two-factor-setup.component';
import { DashboardBuilderComponent } from './components/dashboard-builder/dashboard-builder.component';
import { EmailSchedulerComponent } from './components/email-scheduler/email-scheduler.component';
import { OAuthLoginComponent } from './components/oauth-login/oauth-login.component';
import { BrandingSettingsComponent } from './components/branding-settings/branding-settings.component';
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
import { AuthGuardSimple } from './guards/auth-simple.guard';

export const routes: Routes = [
  { path: '', component: StartupSimpleComponent },
  { path: 'startup', component: StartupSimpleComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardSimple] },
  { path: 'oauth-login', component: OAuthLoginComponent },
  { path: 'enterprise-login', component: EnterpriseLoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuardSimple] },
  { path: 'dashboard-builder', component: DashboardBuilderComponent, canActivate: [AuthGuardSimple] },
  { path: 'email-scheduler', component: EmailSchedulerComponent, canActivate: [AuthGuardSimple] },
  { path: 'two-factor-setup', component: TwoFactorSetupComponent, canActivate: [AuthGuardSimple] },
  { path: 'branding-settings', component: BrandingSettingsComponent, canActivate: [AuthGuardSimple] },
  { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuardSimple] },
  { path: 'dashboard-version-history', component: DashboardVersionHistoryComponent, canActivate: [AuthGuardSimple] },
  { path: 'data-sources', component: DataSourcesComponent, canActivate: [AuthGuardSimple] },
  { path: 'etl-jobs', component: EtlJobsComponent, canActivate: [AuthGuardSimple] },
  { path: 'advanced-analytics', component: AdvancedAnalyticsComponent, canActivate: [AuthGuardSimple] },
  { path: 'audit-trail', component: AuditTrailComponent, canActivate: [AuthGuardSimple] },
  { path: 'tenant-management', component: TenantManagementComponent, canActivate: [AuthGuardSimple] },
  { path: 'temp-access', component: TempAccessComponent, canActivate: [AuthGuardSimple] },
  { path: 'formula-builder', component: FormulaBuilderComponent, canActivate: [AuthGuardSimple] },
  { path: '**', redirectTo: '/startup' }
];

