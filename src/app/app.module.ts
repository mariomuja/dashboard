import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart.component';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { ConversionChartComponent } from './components/conversion-chart/conversion-chart.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
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
    LoginComponent,
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
    CountUpDirective
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

