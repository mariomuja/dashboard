import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { EmailSchedulerComponent } from './email-scheduler.component';

describe('EmailSchedulerComponent', () => {
  let component: EmailSchedulerComponent;
  let fixture: ComponentFixture<EmailSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailSchedulerComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule, FormsModule ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle create form', () => {
    expect(component.showCreateForm).toBe(false);
    component.toggleCreateForm();
    expect(component.showCreateForm).toBe(true);
  });

  it('should add recipient', () => {
    component.recipientInput = 'test@example.com';
    component.addRecipient();
    expect(component.newSchedule.recipients).toContain('test@example.com');
  });

  it('should remove recipient', () => {
    component.newSchedule.recipients = ['test@example.com'];
    component.removeRecipient('test@example.com');
    expect(component.newSchedule.recipients.length).toBe(0);
  });
});

