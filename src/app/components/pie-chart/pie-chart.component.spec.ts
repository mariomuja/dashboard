import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PieChartComponent } from './pie-chart.component';
import { NgChartsModule } from 'ng2-charts';

describe('PieChartComponent', () => {
  let component: PieChartComponent;
  let fixture: ComponentFixture<PieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PieChartComponent ],
      imports: [ NgChartsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have chart data', () => {
    expect(component.pieChartData).toBeDefined();
    expect(component.pieChartData.labels).toBeDefined();
  });

  it('should have chart options', () => {
    expect(component.pieChartOptions).toBeDefined();
  });
});

