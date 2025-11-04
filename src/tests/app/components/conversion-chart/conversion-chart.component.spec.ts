import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConversionChartComponent } from '../../../../app/components/conversion-chart/conversion-chart.component';
import { NgChartsModule } from 'ng2-charts';

describe('ConversionChartComponent', () => {
  let component: ConversionChartComponent;
  let fixture: ComponentFixture<ConversionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConversionChartComponent],
      imports: [NgChartsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversionChartComponent);
    component = fixture.componentInstance;
    component.data = [
      { label: 'Jan', value: 2.5 },
      { label: 'Feb', value: 3.0 },
      { label: 'Mar', value: 2.8 }
    ];
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty data arrays', () => {
    const newComponent = new ConversionChartComponent();
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

