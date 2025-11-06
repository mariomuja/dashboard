import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface DocFile {
  name: string;
  displayName: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentationService {
  private docFiles: DocFile[] = [
    { name: 'ADVANCED-ANALYTICS-GUIDE.md', displayName: 'Advanced Analytics Guide', path: 'docs/ADVANCED-ANALYTICS-GUIDE.md' },
    { name: 'ADVANCED-FEATURES-SUMMARY.md', displayName: 'Advanced Features Summary', path: 'docs/ADVANCED-FEATURES-SUMMARY.md' },
    { name: 'CALCULATED-METRICS-GUIDE.md', displayName: 'Calculated Metrics Guide', path: 'docs/CALCULATED-METRICS-GUIDE.md' },
    { name: 'COMPLETE-FEATURES-LIST.md', displayName: 'Complete Features List', path: 'docs/COMPLETE-FEATURES-LIST.md' },
    { name: 'COMPONENT-FIXES.md', displayName: 'Component Fixes', path: 'docs/COMPONENT-FIXES.md' },
    { name: 'DARK-MODE-TROUBLESHOOTING.md', displayName: 'Dark Mode Troubleshooting', path: 'docs/DARK-MODE-TROUBLESHOOTING.md' },
    { name: 'DASHBOARD-BUILDER-GUIDE.md', displayName: 'Dashboard Builder Guide', path: 'docs/DASHBOARD-BUILDER-GUIDE.md' },
    { name: 'DASHBOARD-VERSION-CONTROL-GUIDE.md', displayName: 'Dashboard Version Control Guide', path: 'docs/DASHBOARD-VERSION-CONTROL-GUIDE.md' },
    { name: 'EMAIL-SETUP.md', displayName: 'Email Setup', path: 'docs/EMAIL-SETUP.md' },
    { name: 'ENTERPRISE-FEATURES.md', displayName: 'Enterprise Features', path: 'docs/ENTERPRISE-FEATURES.md' },
    { name: 'ENTERPRISE-IDENTITY-GUIDE.md', displayName: 'Enterprise Identity Guide', path: 'docs/ENTERPRISE-IDENTITY-GUIDE.md' },
    { name: 'ETL-PIPELINE-GUIDE.md', displayName: 'ETL Pipeline Guide', path: 'docs/ETL-PIPELINE-GUIDE.md' },
    { name: 'FEATURE-SUMMARY.md', displayName: 'Feature Summary', path: 'docs/FEATURE-SUMMARY.md' },
    { name: 'FEATURES.md', displayName: 'Features', path: 'docs/FEATURES.md' },
    { name: 'FILE-UPLOAD-GUIDE.md', displayName: 'File Upload Guide', path: 'docs/FILE-UPLOAD-GUIDE.md' },
    { name: 'IMPLEMENTATION-SUMMARY.md', displayName: 'Implementation Summary', path: 'docs/IMPLEMENTATION-SUMMARY.md' },
    { name: 'MULTI-TENANCY-ADVANCED-USER-MANAGEMENT-GUIDE.md', displayName: 'Multi-Tenancy Advanced User Management Guide', path: 'docs/MULTI-TENANCY-ADVANCED-USER-MANAGEMENT-GUIDE.md' },
    { name: 'MULTI-TENANCY-GUIDE.md', displayName: 'Multi-Tenancy Guide', path: 'docs/MULTI-TENANCY-GUIDE.md' },
    { name: 'MULTIPLE-DATA-SOURCES-GUIDE.md', displayName: 'Multiple Data Sources Guide', path: 'docs/MULTIPLE-DATA-SOURCES-GUIDE.md' },
    { name: 'NEW-FEATURES-SUMMARY.md', displayName: 'New Features Summary', path: 'docs/NEW-FEATURES-SUMMARY.md' },
    { name: 'OAUTH-SETUP.md', displayName: 'OAuth Setup', path: 'docs/OAUTH-SETUP.md' },
    { name: 'RECENT-UPDATES.md', displayName: 'Recent Updates', path: 'docs/RECENT-UPDATES.md' },
    { name: 'SCHEDULED-REPORTS-BRANDING-GUIDE.md', displayName: 'Scheduled Reports & Branding Guide', path: 'docs/SCHEDULED-REPORTS-BRANDING-GUIDE.md' },
    { name: 'UI-MANAGEMENT-GUIDE.md', displayName: 'UI Management Guide', path: 'docs/UI-MANAGEMENT-GUIDE.md' }
  ];

  constructor(private http: HttpClient) { }

  getDocumentList(): DocFile[] {
    return this.docFiles.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  getDocumentContent(path: string): Observable<string> {
    return this.http.get(path, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Error loading documentation:', error);
        return of('# Error Loading Documentation\n\nThe requested documentation could not be loaded. Please try again later.');
      })
    );
  }
}

