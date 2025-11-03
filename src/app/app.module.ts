import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { RevenueChartComponent } from './components/revenue-chart/revenue-chart.component';
import { SalesChartComponent } from './components/sales-chart/sales-chart.component';
import { ConversionChartComponent } from './components/conversion-chart/conversion-chart.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    KpiCardComponent,
    RevenueChartComponent,
    SalesChartComponent,
    ConversionChartComponent,
    AdminComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

