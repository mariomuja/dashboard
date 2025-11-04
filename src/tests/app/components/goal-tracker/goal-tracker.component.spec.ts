import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalTrackerComponent } from '../../../../app/components/goal-tracker/goal-tracker.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('GoalTrackerComponent', () => {
  let component: GoalTrackerComponent;
  let fixture: ComponentFixture<GoalTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoalTrackerComponent ],
      imports: [ BrowserAnimationsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate progress correctly', () => {
    const goal = {
      id: '1',
      title: 'Test Goal',
      current: 50,
      target: 100,
      unit: '$',
      color: '#10b981'
    };
    expect(component.getProgress(goal)).toBe(50);
  });

  it('should not exceed 100% progress', () => {
    const goal = {
      id: '1',
      title: 'Test Goal',
      current: 150,
      target: 100,
      unit: '$',
      color: '#10b981'
    };
    expect(component.getProgress(goal)).toBe(100);
  });

  it('should format value correctly', () => {
    expect(component.formatValue(1000, '$')).toBe('$1,000');
    expect(component.formatValue(3.5, '%')).toBe('3.5%');
    expect(component.formatValue(1234, '')).toBe('1,234');
  });
});

