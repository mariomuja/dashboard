import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizationSelectorComponent } from './organization-selector.component';
import { OrganizationService } from '../../services/organization.service';

describe('OrganizationSelectorComponent', () => {
  let component: OrganizationSelectorComponent;
  let fixture: ComponentFixture<OrganizationSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationSelectorComponent ],
      providers: [ OrganizationService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load organizations on init', () => {
    expect(component.organizations.length).toBeGreaterThan(0);
  });

  it('should toggle selector', () => {
    component.toggleSelector();
    expect(component.showSelector).toBe(true);
    component.toggleSelector();
    expect(component.showSelector).toBe(false);
  });
});

