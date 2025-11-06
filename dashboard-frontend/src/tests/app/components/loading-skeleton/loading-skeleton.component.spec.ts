import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSkeletonComponent } from '../../../../app/components/loading-skeleton/loading-skeleton.component';

describe('LoadingSkeletonComponent', () => {
  let component: LoadingSkeletonComponent;
  let fixture: ComponentFixture<LoadingSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingSkeletonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct number of skeleton items', () => {
    component.count = 3;
    expect(component.items.length).toBe(3);
  });

  it('should show KPI skeleton by default', () => {
    expect(component.type).toBe('kpi');
  });
});

