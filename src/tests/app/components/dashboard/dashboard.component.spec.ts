import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from '../../../../app/components/dashboard/dashboard.component';
import { DataService } from '../../../../app/services/data.service';
import { ExportService } from '../../../../app/services/export.service';
import { KpiCardComponent } from '../../../../app/components/kpi-card/kpi-card.component';
import { RevenueChartComponent } from '../../../../app/components/revenue-chart/revenue-chart.component';
import { SalesChartComponent } from '../../../../app/components/sales-chart/sales-chart.component';
import { ConversionChartComponent } from '../../../../app/components/conversion-chart/conversion-chart.component';
import { ThemeToggleComponent } from '../../../../app/components/theme-toggle/theme-toggle.component';
import { LoadingSkeletonComponent } from '../../../../app/components/loading-skeleton/loading-skeleton.component';
import { PieChartComponent } from '../../../../app/components/pie-chart/pie-chart.component';
import { GoalTrackerComponent } from '../../../../app/components/goal-tracker/goal-tracker.component';
import { DateRangePickerComponent } from '../../../../app/components/date-range-picker/date-range-picker.component';
import { InsightsPanelComponent } from '../../../../app/components/insights-panel/insights-panel.component';
import { ChartDetailModalComponent } from '../../../../app/components/chart-detail-modal/chart-detail-modal.component';
import { OrganizationSelectorComponent } from '../../../../app/components/organization-selector/organization-selector.component';
import { CountUpDirective } from '../../../../app/directives/count-up.directive';
import { OrganizationService } from '../../../../app/services/organization.service';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'getKpiData',
      'getRevenueData',
      'getSalesData',
      'getConversionData',
      'reloadData'
    ]);

    await TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        KpiCardComponent,
        RevenueChartComponent,
        SalesChartComponent,
        ConversionChartComponent,
        ThemeToggleComponent,
        LoadingSkeletonComponent,
        PieChartComponent,
        GoalTrackerComponent,
        DateRangePickerComponent,
        InsightsPanelComponent,
        ChartDetailModalComponent,
        OrganizationSelectorComponent,
        CountUpDirective
      ],
      imports: [NgChartsModule, BrowserAnimationsModule, RouterTestingModule, FormsModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        ExportService,
        OrganizationService
      ]
    }).compileComponents();

    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    
    dataService.getKpiData.and.returnValue(of([
      {
        id: '1',
        title: 'Test KPI',
        value: '$100',
        change: 10,
        trend: 'up' as const,
        icon: '💰',
        color: '#10b981'
      }
    ]));

    dataService.getRevenueData.and.returnValue(of([
      { label: 'Jan', value: 1000 }
    ]));

    dataService.getSalesData.and.returnValue(of([
      { label: 'Jan', value: 50 }
    ]));

    dataService.getConversionData.and.returnValue(of([
      { label: 'Jan', value: 3.5 }
    ]));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default period', () => {
    expect(component.selectedPeriod).toBe('month');
  });

  it('should load data on init', () => {
    expect(dataService.getKpiData).toHaveBeenCalled();
    expect(dataService.getRevenueData).toHaveBeenCalled();
    expect(dataService.getSalesData).toHaveBeenCalled();
    expect(dataService.getConversionData).toHaveBeenCalled();
  });

  it('should change period when onPeriodChange is called', () => {
    component.onPeriodChange('year');
    expect(component.selectedPeriod).toBe('year');
  });

  it('should populate kpiData array', () => {
    expect(component.kpiData.length).toBeGreaterThan(0);
  });

  it('should populate revenue data array', () => {
    expect(component.revenueData.length).toBeGreaterThan(0);
  });

  it('should populate sales data array', () => {
    expect(component.salesData.length).toBeGreaterThan(0);
  });

  it('should populate conversion data array', () => {
    expect(component.conversionData.length).toBeGreaterThan(0);
  });
});

