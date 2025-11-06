import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartDetailModalComponent } from '../../../../app/components/chart-detail-modal/chart-detail-modal.component';

describe('ChartDetailModalComponent', () => {
  let component: ChartDetailModalComponent;
  let fixture: ComponentFixture<ChartDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartDetailModalComponent ],
      imports: [ BrowserAnimationsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartDetailModalComponent);
    component = fixture.componentInstance;
    component.data = [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 150 }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total value', () => {
    expect(component.getTotalValue()).toBe(250);
  });

  it('should calculate average value', () => {
    expect(component.getAverageValue()).toBe(125);
  });
});

