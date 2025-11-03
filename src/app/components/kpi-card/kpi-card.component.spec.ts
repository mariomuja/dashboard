import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KpiCardComponent } from './kpi-card.component';
import { CountUpDirective } from '../../directives/count-up.directive';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KpiCardComponent, CountUpDirective],
      imports: [BrowserAnimationsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
    component.kpi = {
      id: '1',
      title: 'Test Revenue',
      value: '$1,234',
      change: 12.5,
      trend: 'up',
      icon: '💰',
      color: '#10b981'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display KPI data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.kpi-title')?.textContent).toContain('Test Revenue');
    // CountUp directive animates the value, so we just check the element exists
    expect(compiled.querySelector('.kpi-value')).toBeTruthy();
  });

  it('should display trend indicator for upward trend', () => {
    component.kpi.trend = 'up';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const changeElement = compiled.querySelector('.kpi-change.positive');
    expect(changeElement).toBeTruthy();
    expect(changeElement?.textContent).toContain('↑');
  });

  it('should display trend indicator for downward trend', () => {
    component.kpi.trend = 'down';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const changeElement = compiled.querySelector('.kpi-change.negative');
    expect(changeElement).toBeTruthy();
    expect(changeElement?.textContent).toContain('↓');
  });

  it('should display trend indicator for stable trend', () => {
    component.kpi.trend = 'stable';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const changeElement = compiled.querySelector('.kpi-change.neutral');
    expect(changeElement).toBeTruthy();
    expect(changeElement?.textContent).toContain('→');
  });

  it('should display icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iconElement = compiled.querySelector('.kpi-icon');
    expect(iconElement?.textContent).toBe('💰');
  });
});

