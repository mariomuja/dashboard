import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DashboardBuilderComponent } from './dashboard-builder.component';

describe('DashboardBuilderComponent', () => {
  let component: DashboardBuilderComponent;
  let fixture: ComponentFixture<DashboardBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardBuilderComponent ],
      imports: [ RouterTestingModule, BrowserAnimationsModule, DragDropModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load widgets on init', () => {
    expect(component.widgets).toBeDefined();
    expect(component.widgets.length).toBeGreaterThan(0);
  });

  it('should toggle widget visibility', () => {
    const widget = component.widgets[0];
    const initialVisibility = widget.visible;
    component.toggleWidget(widget.id);
    expect(widget.visible).toBe(!initialVisibility);
  });

  it('should add new widget', () => {
    const initialCount = component.widgets.length;
    component.addWidget('kpi');
    expect(component.widgets.length).toBe(initialCount + 1);
  });

  it('should get widget label', () => {
    const label = component.getWidgetLabel('kpi');
    expect(label).toBe('KPI Cards');
  });
});

