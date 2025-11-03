import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DataService } from '../../services/data.service';
import { KpiCardComponent } from '../kpi-card/kpi-card.component';
import { RevenueChartComponent } from '../revenue-chart/revenue-chart.component';
import { SalesChartComponent } from '../sales-chart/sales-chart.component';
import { ConversionChartComponent } from '../conversion-chart/conversion-chart.component';
import { NgChartsModule } from 'ng2-charts';
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
      'getConversionData'
    ]);

    await TestBed.configureTestingModule({
      declarations: [
        DashboardComponent,
        KpiCardComponent,
        RevenueChartComponent,
        SalesChartComponent,
        ConversionChartComponent
      ],
      imports: [NgChartsModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
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

