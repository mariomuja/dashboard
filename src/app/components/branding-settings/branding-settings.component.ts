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
  customCss = '';
  private customStyleElement: HTMLStyleElement | null = null;
  
  availableFonts = [
    { name: 'Default', value: 'system-ui, -apple-system, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Courier New', value: '"Courier New", Courier, monospace' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { name: 'Roboto', value: '"Roboto", sans-serif' },
    { name: 'Open Sans', value: '"Open Sans", sans-serif' },
    { name: 'Lato', value: '"Lato", sans-serif' },
    { name: 'Montserrat', value: '"Montserrat", sans-serif' },
    { name: 'Inter', value: '"Inter", sans-serif' }
  ];

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
    
    // Load saved custom CSS
    const savedCss = localStorage.getItem('custom_css');
    if (savedCss) {
      this.customCss = savedCss;
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
      this.applyFontFamily();
    }
  }
  
  onFontChange(): void {
    this.applyFontFamily();
  }
  
  private applyFontFamily(): void {
    if (this.branding?.fontFamily) {
      document.documentElement.style.setProperty('--font-family', this.branding.fontFamily);
    }
  }

  applyCustomCss(): void {
    // Remove existing custom style if present
    if (this.customStyleElement) {
      this.customStyleElement.remove();
    }

    if (this.customCss.trim()) {
      // Create new style element
      this.customStyleElement = document.createElement('style');
      this.customStyleElement.setAttribute('data-custom-branding', 'true');
      this.customStyleElement.textContent = this.customCss;
      document.head.appendChild(this.customStyleElement);
      
      // Save to localStorage
      localStorage.setItem('custom_css', this.customCss);
      
      alert('Custom CSS applied! Changes are visible immediately.');
    } else {
      localStorage.removeItem('custom_css');
      alert('Custom CSS cleared.');
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

