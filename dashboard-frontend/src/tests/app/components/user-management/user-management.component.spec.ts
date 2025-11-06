import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserManagementComponent } from '../../../../app/components/user-management/user-management.component';
import { UserManagementService } from '../../../../app/services/user-management.service';
import { OrganizationService } from '../../../../app/services/organization.service';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserManagementComponent ],
      imports: [ RouterTestingModule, FormsModule, CommonModule ],
      providers: [ UserManagementService, OrganizationService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(component.users).toBeDefined();
  });

  it('should toggle invite form', () => {
    component.toggleInviteForm();
    expect(component.showInviteForm).toBe(true);
  });
});

