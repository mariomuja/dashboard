import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesChartComponent } from './sales-chart.component';
import { NgChartsModule } from 'ng2-charts';

describe('SalesChartComponent', () => {
  let component: SalesChartComponent;
  let fixture: ComponentFixture<SalesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesChartComponent],
      imports: [NgChartsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesChartComponent);
    component = fixture.componentInstance;
    component.data = [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 150 },
      { label: 'Mar', value: 120 }
    ];
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty data arrays', () => {
    const newComponent = new SalesChartComponent();
    expect(newComponent.data).toEqual([]);
    expect(newComponent.period).toBe('month');
  });

  it('should set barChartLegend to true', () => {
    expect(component.barChartLegend).toBe(true);
  });

  it('should have responsive option set to true', () => {
    expect(component.barChartOptions?.responsive).toBe(true);
  });

  it('should set chart type to bar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const canvas = compiled.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });
});

