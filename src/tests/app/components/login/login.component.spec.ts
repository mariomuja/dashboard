import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from '../../../../app/components/login/login.component';
import { AuthService } from '../../../../app/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    sessionStorage.clear();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error for empty password', () => {
    component.password = '';
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Please enter a password');
  });

  it('should navigate to admin on successful login', () => {
    authService.login.and.returnValue(true);
    component.password = 'admin123';
    
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith('admin123');
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show error on failed login', () => {
    authService.login.and.returnValue(false);
    component.password = 'wrongpassword';
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Invalid password. Please try again.');
    expect(component.password).toBe('');
  });

  it('should redirect to stored URL after successful login', () => {
    sessionStorage.setItem('redirect_url', '/admin');
    authService.login.and.returnValue(true);
    component.password = 'admin123';
    
    component.onSubmit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBe(false);
    
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });
});

