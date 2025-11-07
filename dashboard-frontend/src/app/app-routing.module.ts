import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartupComponent } from './components/startup/startup.component';
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
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: StartupComponent },
  { path: 'startup', component: StartupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'oauth-login', component: OAuthLoginComponent },
  { path: 'enterprise-login', component: EnterpriseLoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'branding', component: BrandingSettingsComponent, canActivate: [authGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [authGuard] },
  { path: 'data-sources', component: DataSourcesComponent, canActivate: [authGuard] },
  { path: 'etl-jobs', component: EtlJobsComponent, canActivate: [authGuard] },
  { path: 'analytics', component: AdvancedAnalyticsComponent, canActivate: [authGuard] },
  { path: 'audit-trail', component: AuditTrailComponent, canActivate: [authGuard] },
  { path: 'tenants', component: TenantManagementComponent, canActivate: [authGuard] },
  { path: 'temp-access', component: TempAccessComponent, canActivate: [authGuard] },
  { path: 'formula-builder', component: FormulaBuilderComponent, canActivate: [authGuard] },
  { path: '2fa-setup', component: TwoFactorSetupComponent, canActivate: [authGuard] },
  { path: 'email-scheduler', component: EmailSchedulerComponent, canActivate: [authGuard] },
  { path: 'builder', component: DashboardBuilderComponent },
  { path: 'version-history', component: DashboardVersionHistoryComponent },
  { path: '**', redirectTo: '/startup' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



