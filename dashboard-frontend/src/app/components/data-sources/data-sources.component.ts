import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataSourceService, DataSource, DataSourceType, DataSourceTemplate } from '../../services/data-source.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.css']
})
export class DataSourcesComponent implements OnInit {
  dataSources: DataSource[] = [];
  templates: DataSourceTemplate[] = [];
  selectedTemplate: DataSourceTemplate | null = null;
  
  // UI state
  showCreateForm = false;
  showCredentialsForm = false;
  editingDataSource: DataSource | null = null;
  testingDataSource: DataSource | null = null;
  testResult: any = null;
  
  // Form data
  newDataSource: Partial<DataSource> = {
    name: '',
    type: 'postgresql' as DataSourceType,
    config: {},
    credentials: {},
    tenantId: 'tenant-1',
    organizationId: 'org-1'
  };
  
  // Filters
  filterType: DataSourceType | '' = '';
  searchQuery = '';
  showConnectedOnly = false;
  
  statistics: any = null;

  constructor(
    private dataSourceService: DataSourceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDataSources();
    this.loadTemplates();
    this.loadStatistics();
  }

  loadDataSources(): void {
    this.dataSources = this.dataSourceService.getAllDataSources();
  }

  loadTemplates(): void {
    this.templates = this.dataSourceService.getTemplates();
  }

  loadStatistics(): void {
    this.statistics = this.dataSourceService.getStatistics();
  }

  get filteredDataSources(): DataSource[] {
    let filtered = [...this.dataSources];

    if (this.filterType) {
      filtered = filtered.filter(ds => ds.type === this.filterType);
    }

    if (this.showConnectedOnly) {
      filtered = filtered.filter(ds => ds.status === 'connected');
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(ds =>
        ds.name.toLowerCase().includes(query) ||
        ds.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get uniqueTypes(): DataSourceType[] {
    const types = new Set(this.dataSources.map(ds => ds.type));
    return Array.from(types).sort();
  }

  selectTemplate(template: DataSourceTemplate): void {
    this.selectedTemplate = template;
    this.newDataSource = {
      name: '',
      type: template.type,
      config: { ...template.defaultConfig },
      credentials: {},
      tenantId: 'tenant-1',
      organizationId: 'org-1'
    };
    this.showCreateForm = true;
  }

  createDataSource(): void {
    if (!this.newDataSource.name || !this.newDataSource.type) {
      alert('Please fill in all required fields');
      return;
    }

    const dataSource = this.dataSourceService.createDataSource(this.newDataSource as any);
    this.loadDataSources();
    this.loadStatistics();
    this.resetForm();
    alert(`Data source "${dataSource.name}" created successfully!`);
  }

  editDataSource(dataSource: DataSource): void {
    this.editingDataSource = { ...dataSource };
    this.showCreateForm = true;
  }

  updateDataSource(): void {
    if (!this.editingDataSource) return;

    this.dataSourceService.updateDataSource(this.editingDataSource.id, this.editingDataSource);
    this.loadDataSources();
    this.loadStatistics();
    this.editingDataSource = null;
    this.showCreateForm = false;
    alert('Data source updated successfully!');
  }

  deleteDataSource(dataSource: DataSource): void {
    if (!confirm(`Delete data source "${dataSource.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    const success = this.dataSourceService.deleteDataSource(dataSource.id);
    if (success) {
      this.loadDataSources();
      this.loadStatistics();
      alert('Data source deleted successfully!');
    }
  }

  testConnection(dataSource: DataSource): void {
    this.testingDataSource = dataSource;
    this.testResult = null;

    this.dataSourceService.testConnection(dataSource).subscribe({
      next: (result) => {
        this.testResult = result;
        this.testingDataSource = null;
        this.loadDataSources();
      },
      error: (error) => {
        this.testResult = {
          success: false,
          message: error.message || 'Connection test failed'
        };
        this.testingDataSource = null;
      }
    });
  }

  syncDataSource(dataSource: DataSource): void {
    if (!confirm(`Sync data from "${dataSource.name}"?`)) {
      return;
    }

    this.dataSourceService.syncDataSource(dataSource.id).subscribe({
      next: (success) => {
        if (success) {
          this.loadDataSources();
          alert('Data synced successfully!');
        } else {
          alert('Sync failed. Check console for details.');
        }
      },
      error: (error) => {
        alert(`Sync failed: ${error.message}`);
      }
    });
  }

  fetchData(dataSource: DataSource): void {
    this.dataSourceService.fetchData(dataSource.id).subscribe({
      next: (data) => {
        console.log('Fetched data:', data);
        alert(`Fetched ${data.length} records from "${dataSource.name}"`);
      },
      error: (error) => {
        alert(`Fetch failed: ${error.message}`);
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newDataSource = {
      name: '',
      type: 'postgresql' as DataSourceType,
      config: {},
      credentials: {},
      tenantId: 'tenant-1',
      organizationId: 'org-1'
    };
    this.selectedTemplate = null;
    this.editingDataSource = null;
    this.showCreateForm = false;
  }

  cancelEdit(): void {
    this.editingDataSource = null;
    this.showCreateForm = false;
    this.resetForm();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '⭕';
      case 'error': return '❌';
      case 'testing': return '⏳';
      default: return '❓';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'connected': return '#10b981';
      case 'disconnected': return '#6b7280';
      case 'error': return '#ef4444';
      case 'testing': return '#f59e0b';
      default: return '#9ca3af';
    }
  }

  getTypeIcon(type: DataSourceType): string {
    const template = this.templates.find(t => t.type === type);
    return template?.icon || '🔌';
  }

  formatDate(date: Date | undefined): string {
    return date ? new Date(date).toLocaleString() : 'Never';
  }

  getTypeCount(): number {
    return this.statistics?.byType ? Object.keys(this.statistics.byType).length : 0;
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

