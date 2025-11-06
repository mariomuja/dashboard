import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from '../../../../app/components/theme-toggle/theme-toggle.component';
import { ThemeService } from '../../../../app/services/theme.service';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThemeToggleComponent ],
      providers: [ ThemeService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle theme when button is clicked', () => {
    spyOn(themeService, 'toggleTheme');
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should display current theme icon', () => {
    component.currentTheme = 'light';
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.theme-icon');
    expect(icon.textContent).toContain('🌙');
  });
});

