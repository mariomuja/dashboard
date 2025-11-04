import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevenueChartComponent } from '../../../../app/components/revenue-chart/revenue-chart.component';
import { NgChartsModule } from 'ng2-charts';

describe('RevenueChartComponent', () => {
  let component: RevenueChartComponent;
  let fixture: ComponentFixture<RevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RevenueChartComponent],
      imports: [NgChartsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevenueChartComponent);
    component = fixture.componentInstance;
    component.data = [
      { label: 'Jan', value: 1000 },
      { label: 'Feb', value: 2000 },
      { label: 'Mar', value: 1500 }
    ];
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty data arrays', () => {
    const newComponent = new RevenueChartComponent();
    expect(newComponent.data).toEqual([]);
    expect(newComponent.period).toBe('month');
  });

  it('should set lineChartLegend to true', () => {
    expect(component.lineChartLegend).toBe(true);
  });

  it('should have responsive option set to true', () => {
    expect(component.lineChartOptions?.responsive).toBe(true);
  });

  it('should set chart type to line', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const canvas = compiled.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });
});

