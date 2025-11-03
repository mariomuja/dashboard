import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateRangePickerComponent } from './date-range-picker.component';

describe('DateRangePickerComponent', () => {
  let component: DateRangePickerComponent;
  let fixture: ComponentFixture<DateRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateRangePickerComponent ],
      imports: [ FormsModule, BrowserAnimationsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle picker', () => {
    expect(component.showPicker).toBe(false);
    component.togglePicker();
    expect(component.showPicker).toBe(true);
  });

  it('should clear selection', () => {
    component.startDate = '2024-01-01';
    component.endDate = '2024-01-31';
    component.clearSelection();
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
  });
});

