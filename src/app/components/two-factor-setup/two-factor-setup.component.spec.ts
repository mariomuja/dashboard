import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TwoFactorSetupComponent } from './two-factor-setup.component';

describe('TwoFactorSetupComponent', () => {
  let component: TwoFactorSetupComponent;
  let fixture: ComponentFixture<TwoFactorSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwoFactorSetupComponent ],
      imports: [ FormsModule, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoFactorSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

