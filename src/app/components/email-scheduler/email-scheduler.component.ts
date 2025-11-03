import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface EmailSchedule {
  id?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  reportType: 'summary' | 'detailed';
  active?: boolean;
  createdAt?: Date;
}

@Component({
  selector: 'app-email-scheduler',
  templateUrl: './email-scheduler.component.html',
  styleUrls: ['./email-scheduler.component.css']
})
export class EmailSchedulerComponent implements OnInit {
  private apiUrl = 'http://localhost:3002/api/email';

  schedules: EmailSchedule[] = [];
  showCreateForm = false;
  
  newSchedule: EmailSchedule = {
    frequency: 'daily',
    time: '09:00',
    recipients: [],
    reportType: 'summary'
  };

  recipientInput = '';
  isSending = false;
  testEmailRecipient = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.http.get<any>(`${this.apiUrl}/schedules`).subscribe({
      next: (response) => {
        this.schedules = response.schedules || [];
      },
      error: (error) => {
        console.error('Error loading schedules:', error);
      }
    });
  }

  addRecipient(): void {
    const email = this.recipientInput.trim();
    if (email && this.isValidEmail(email)) {
      if (!this.newSchedule.recipients.includes(email)) {
        this.newSchedule.recipients.push(email);
        this.recipientInput = '';
      }
    } else {
      alert('Please enter a valid email address');
    }
  }

  removeRecipient(email: string): void {
    this.newSchedule.recipients = this.newSchedule.recipients.filter(r => r !== email);
  }

  createSchedule(): void {
    if (this.newSchedule.recipients.length === 0) {
      alert('Please add at least one recipient');
      return;
    }

    // Get current dashboard data (simplified - in real app would fetch from service)
    const dashboardData = {
      period: 'Current',
      kpis: [] // Would fetch from DataService
    };

    const payload = {
      ...this.newSchedule,
      dashboardData
    };

    this.http.post(`${this.apiUrl}/schedule`, payload).subscribe({
      next: (response: any) => {
        alert('Email schedule created successfully!');
        this.loadSchedules();
        this.showCreateForm = false;
        this.resetForm();
      },
      error: (error) => {
        alert('Failed to create schedule: ' + (error.error?.error || 'Unknown error'));
        console.error('Error:', error);
      }
    });
  }

  deleteSchedule(id: string): void {
    if (confirm('Delete this email schedule?')) {
      this.http.delete(`${this.apiUrl}/schedule/${id}`).subscribe({
        next: () => {
          this.loadSchedules();
        },
        error: (error) => {
          alert('Failed to delete schedule');
          console.error('Error:', error);
        }
      });
    }
  }

  sendTestEmail(): void {
    if (!this.testEmailRecipient || !this.isValidEmail(this.testEmailRecipient)) {
      alert('Please enter a valid email address');
      return;
    }

    this.isSending = true;

    const payload = {
      recipients: [this.testEmailRecipient],
      subject: 'Test Email from KPI Dashboard',
      dashboardData: {
        period: 'Test',
        kpis: [
          {
            id: '1',
            title: 'Test Metric',
            value: '$1,234',
            change: 12.5,
            trend: 'up',
            icon: '📊',
            color: '#10b981'
          }
        ]
      }
    };

    this.http.post(`${this.apiUrl}/send`, payload).subscribe({
      next: (response: any) => {
        alert('Test email sent! Check your inbox.\n\nPreview: ' + (response.previewUrl || 'N/A'));
        this.isSending = false;
      },
      error: (error) => {
        alert('Failed to send test email. Make sure email server is running on port 3002.');
        console.error('Error:', error);
        this.isSending = false;
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private resetForm(): void {
    this.newSchedule = {
      frequency: 'daily',
      time: '09:00',
      recipients: [],
      reportType: 'summary'
    };
    this.recipientInput = '';
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

