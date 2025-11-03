import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { BrandingSettingsComponent } from './branding-settings.component';
import { OrganizationService } from '../../services/organization.service';

describe('BrandingSettingsComponent', () => {
  let component: BrandingSettingsComponent;
  let fixture: ComponentFixture<BrandingSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandingSettingsComponent ],
      imports: [ RouterTestingModule, FormsModule ],
      providers: [ OrganizationService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandingSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize branding settings', () => {
    expect(component.branding).toBeTruthy();
  });
});

