import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OAuthLoginComponent } from './oauth-login.component';

describe('OAuthLoginComponent', () => {
  let component: OAuthLoginComponent;
  let fixture: ComponentFixture<OAuthLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OAuthLoginComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OAuthLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

