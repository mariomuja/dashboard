import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  private apiUrl = 'http://localhost:3000/api';
  uploadStatus = '';
  isUploading = false;
  private readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) { }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.uploadStatus = '❌ File too large. Maximum size is 1MB';
        return;
      }
      
      // Validate file type
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        this.uploadStatus = '❌ Only JSON files are allowed';
        return;
      }
      
      this.uploadFile(file);
    }
  }

  uploadFile(file: File): void {
    const formData = new FormData();
    formData.append('file', file);

    this.isUploading = true;
    this.uploadStatus = 'Uploading...';

    this.http.post(`${this.apiUrl}/upload/dashboard-data`, formData).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        this.uploadStatus = '✅ ' + response.message;
        
        // Clear cache and reload data
        this.dataService.reloadData();
        
        // Reload the page after 1 second to show new data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadStatus = '❌ Upload failed: ' + (error.error?.error || 'Unknown error');
        console.error('Upload error:', error);
      }
    });
  }

  downloadCurrentData(): void {
    // First try to get from backend API
    this.http.get(`${this.apiUrl}/data/dashboard-data`).subscribe({
      next: (data) => {
        this.downloadFile(data);
      },
      error: (error) => {
        console.warn('Backend not available, falling back to assets file:', error);
        // Fallback: download directly from assets
        this.http.get('assets/data/dashboard-data.json').subscribe({
          next: (data) => {
            this.downloadFile(data);
          },
          error: (assetError) => {
            alert('Failed to download data. Make sure the data file exists.');
            console.error('Download error:', assetError);
          }
        });
      }
    });
  }

  private downloadFile(data: any): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-data.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

