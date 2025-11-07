import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';
import { DataService } from '../../services/data.service';

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
    private router: Router,
    private orgService: OrganizationService,
    private dataService: DataService
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

    // Get current dashboard data and branding
    this.dataService.getKpiData('month').subscribe(kpis => {
      const org = this.orgService.getCurrentOrganization();
      const branding = org ? {
        primaryColor: org.settings.branding.primaryColor,
        secondaryColor: org.settings.branding.secondaryColor,
        companyName: org.settings.branding.companyName,
        logoUrl: org.settings.branding.logo || '',
        fontFamily: org.settings.branding.fontFamily || 'Arial, sans-serif'
      } : null;

      const dashboardData = {
        period: 'Current',
        kpis: kpis
      };

      const payload = {
        ...this.newSchedule,
        dashboardData,
        branding
      };

      this.http.post(`${this.apiUrl}/schedule`, payload).subscribe({
        next: (response: any) => {
          alert('Email schedule created successfully with your branding!');
          this.loadSchedules();
          this.showCreateForm = false;
          this.resetForm();
        },
        error: (error) => {
          alert('Failed to create schedule: ' + (error.error?.error || 'Unknown error'));
          console.error('Error:', error);
        }
      });
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

    // Get branding
    const org = this.orgService.getCurrentOrganization();
    const branding = org ? {
      primaryColor: org.settings.branding.primaryColor,
      secondaryColor: org.settings.branding.secondaryColor,
      companyName: org.settings.branding.companyName,
      logoUrl: org.settings.branding.logo || '',
      fontFamily: org.settings.branding.fontFamily || 'Arial, sans-serif'
    } : null;

    const payload = {
      recipients: [this.testEmailRecipient],
      subject: `Test Email from ${branding?.companyName || 'KPI Dashboard'}`,
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
            color: branding?.primaryColor || '#10b981'
          }
        ]
      },
      branding
    };

    this.http.post(`${this.apiUrl}/send`, payload).subscribe({
      next: (response: any) => {
        alert('Test email sent with your branding! Check your inbox.\n\nPreview: ' + (response.previewUrl || 'N/A'));
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


