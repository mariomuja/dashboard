import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InsightsPanelComponent } from '../../../../app/components/insights-panel/insights-panel.component';

describe('InsightsPanelComponent', () => {
  let component: InsightsPanelComponent;
  let fixture: ComponentFixture<InsightsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsightsPanelComponent ],
      imports: [ BrowserAnimationsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsightsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle panel', () => {
    expect(component.showPanel).toBe(true);
    component.togglePanel();
    expect(component.showPanel).toBe(false);
  });
});

