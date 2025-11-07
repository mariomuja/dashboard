import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardVersionControlService, DashboardVersion, VersionComparison } from '../../services/dashboard-version-control.service';
import { DashboardLayoutService } from '../../services/dashboard-layout.service';

@Component({
  selector: 'app-dashboard-version-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-version-history.component.html',
  styleUrls: ['./dashboard-version-history.component.css']
})
export class DashboardVersionHistoryComponent implements OnInit {
  versions: DashboardVersion[] = [];
  selectedVersion: DashboardVersion | null = null;
  compareVersion1: DashboardVersion | null = null;
  compareVersion2: DashboardVersion | null = null;
  comparison: VersionComparison | null = null;
  showCompareMode = false;
  statistics: any = null;
  filterTag = '';
  searchQuery = '';

  constructor(
    private versionControl: DashboardVersionControlService,
    private layoutService: DashboardLayoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVersions();
    this.loadStatistics();
  }

  loadVersions(): void {
    this.versions = this.versionControl.getVersionsByDashboard('dashboard-main');
  }

  loadStatistics(): void {
    this.statistics = this.versionControl.getStatistics('dashboard-main');
  }

  get filteredVersions(): DashboardVersion[] {
    let filtered = [...this.versions];

    if (this.filterTag) {
      filtered = filtered.filter(v => v.tags.includes(this.filterTag));
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        v.createdBy.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  get allTags(): string[] {
    const tagSet = new Set<string>();
    this.versions.forEach(v => v.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }

  selectVersion(version: DashboardVersion): void {
    this.selectedVersion = version;
  }

  rollbackToVersion(version: DashboardVersion): void {
    if (!confirm(`Rollback to version ${version.version}?\n\nCurrent state will be saved as a new version before rolling back.`)) {
      return;
    }

    const restored = this.versionControl.rollbackToVersion(version.id);

    if (restored) {
      this.layoutService.updateLayout(restored.layout);
      this.loadVersions();
      this.loadStatistics();
      alert(`Successfully rolled back to version ${version.version}!\n\nCreated new version ${restored.version} from rollback.`);
    } else {
      alert('Failed to rollback. Please try again.');
    }
  }

  deleteVersion(version: DashboardVersion): void {
    if (version.isActive) {
      alert('Cannot delete the active version!');
      return;
    }

    if (!confirm(`Delete version ${version.version}?\n\nThis action cannot be undone.`)) {
      return;
    }

    const success = this.versionControl.deleteVersion(version.id);

    if (success) {
      this.loadVersions();
      this.loadStatistics();
      if (this.selectedVersion?.id === version.id) {
        this.selectedVersion = null;
      }
      alert('Version deleted successfully!');
    } else {
      alert('Failed to delete version.');
    }
  }

  toggleCompareMode(): void {
    this.showCompareMode = !this.showCompareMode;
    if (!this.showCompareMode) {
      this.compareVersion1 = null;
      this.compareVersion2 = null;
      this.comparison = null;
    }
  }

  selectForComparison(version: DashboardVersion): void {
    if (!this.compareVersion1) {
      this.compareVersion1 = version;
    } else if (!this.compareVersion2 && version.id !== this.compareVersion1.id) {
      this.compareVersion2 = version;
      this.compareVersions();
    } else {
      // Reset and start over
      this.compareVersion1 = version;
      this.compareVersion2 = null;
      this.comparison = null;
    }
  }

  compareVersions(): void {
    if (this.compareVersion1 && this.compareVersion2) {
      this.comparison = this.versionControl.compareVersions(
        this.compareVersion1.id,
        this.compareVersion2.id
      );
    }
  }

  addTag(version: DashboardVersion): void {
    const tag = prompt('Enter tag name:');
    if (tag) {
      this.versionControl.tagVersion(version.id, tag.trim());
      this.loadVersions();
      this.loadStatistics();
    }
  }

  removeTag(version: DashboardVersion, tag: string): void {
    if (confirm(`Remove tag "${tag}"?`)) {
      this.versionControl.removeTag(version.id, tag);
      this.loadVersions();
      this.loadStatistics();
    }
  }

  exportHistory(): void {
    const json = this.versionControl.exportHistory('dashboard-main');
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-version-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  goBack(): void {
    this.router.navigate(['/builder']);
  }

  goToDashboard(): void {
    this.router.navigate(['/']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getChangeTypeIcon(changeType: string): string {
    switch (changeType) {
      case 'created': return '✨';
      case 'updated': return '📝';
      case 'restored': return '⏮️';
      default: return '📄';
    }
  }

  getChangeTypeColor(changeType: string): string {
    switch (changeType) {
      case 'created': return '#10b981';
      case 'updated': return '#3b82f6';
      case 'restored': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  getTagCount(): number {
    return this.statistics?.tagCounts ? Object.keys(this.statistics.tagCounts).length : 0;
  }
}
