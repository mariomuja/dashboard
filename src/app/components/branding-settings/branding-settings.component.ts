import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationService, OrganizationSettings } from '../../services/organization.service';

@Component({
  selector: 'app-branding-settings',
  templateUrl: './branding-settings.component.html',
  styleUrls: ['./branding-settings.component.css']
})
export class BrandingSettingsComponent implements OnInit {
  branding: OrganizationSettings['branding'] | null = null;
  logoPreview: string | null = null;
  isSaving = false;

  constructor(
    private orgService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const org = this.orgService.getCurrentOrganization();
    if (org) {
      this.branding = { ...org.settings.branding };
      this.logoPreview = this.branding.logo || null;
    } else {
      // Default branding
      this.branding = {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        companyName: 'KPI Dashboard',
        theme: 'auto'
      };
    }
  }

  onLogoSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Logo must be smaller than 1MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        if (this.branding) {
          this.branding.logo = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreview = null;
    if (this.branding) {
      this.branding.logo = undefined;
    }
  }

  saveBranding(): void {
    if (!this.branding) return;

    this.isSaving = true;
    
    this.orgService.updateBranding(this.branding);
    
    setTimeout(() => {
      this.isSaving = false;
      alert('Branding settings saved successfully!');
    }, 500);
  }

  resetToDefault(): void {
    if (confirm('Reset to default branding?')) {
      this.branding = {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        companyName: 'KPI Dashboard',
        theme: 'auto'
      };
      this.logoPreview = null;
    }
  }

  previewBranding(): void {
    if (this.branding) {
      this.orgService.updateBranding(this.branding);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

