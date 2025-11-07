import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartupComponent } from './components/startup/startup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginSimpleComponent } from './components/login/login-simple.component';
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
import { authGuardSimple } from './guards/auth-simple.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'startup', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginSimpleComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuardSimple] },
  { path: 'oauth-login', component: OAuthLoginComponent },
  { path: 'enterprise-login', component: EnterpriseLoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuardSimple] },
  { path: 'branding', component: BrandingSettingsComponent, canActivate: [authGuardSimple] },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuardSimple] },
  { path: 'data-sources', component: DataSourcesComponent, canActivate: [authGuardSimple] },
  { path: 'etl-jobs', component: EtlJobsComponent, canActivate: [authGuardSimple] },
  { path: 'analytics', component: AdvancedAnalyticsComponent, canActivate: [authGuardSimple] },
  { path: 'audit-trail', component: AuditTrailComponent, canActivate: [authGuardSimple] },
  { path: 'tenants', component: TenantManagementComponent, canActivate: [authGuardSimple] },
  { path: 'temp-access', component: TempAccessComponent, canActivate: [authGuardSimple] },
  { path: 'formula-builder', component: FormulaBuilderComponent, canActivate: [authGuardSimple] },
  { path: '2fa-setup', component: TwoFactorSetupComponent, canActivate: [authGuardSimple] },
  { path: 'email-scheduler', component: EmailSchedulerComponent, canActivate: [authGuardSimple] },
  { path: 'builder', component: DashboardBuilderComponent },
  { path: 'version-history', component: DashboardVersionHistoryComponent },
  { path: '**', redirectTo: '/startup' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



