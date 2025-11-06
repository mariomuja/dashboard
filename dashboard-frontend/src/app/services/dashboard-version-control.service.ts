import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardLayout } from './dashboard-layout.service';

export interface DashboardVersion {
  id: string;
  dashboardId: string;
  version: number;
  name: string;
  description: string;
  layout: DashboardLayout;
  createdBy: string;
  createdAt: Date;
  tags: string[];
  isActive: boolean;
  metadata: {
    widgetCount: number;
    changeType: 'created' | 'updated' | 'restored';
    changesSummary: string[];
  };
}

export interface VersionComparison {
  added: any[];
  removed: any[];
  modified: any[];
  unchanged: any[];
}

export interface VersionHistory {
  dashboardId: string;
  versions: DashboardVersion[];
  activeVersion: DashboardVersion | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardVersionControlService {
  private readonly VERSIONS_KEY = 'dashboard_versions';
  private readonly MAX_VERSIONS = 50; // Keep last 50 versions per dashboard
  
  private versionsSubject: BehaviorSubject<DashboardVersion[]>;
  public versions$: Observable<DashboardVersion[]>;
  
  private versions: DashboardVersion[] = [];

  constructor() {
    this.loadVersions();
    this.versionsSubject = new BehaviorSubject<DashboardVersion[]>(this.versions);
    this.versions$ = this.versionsSubject.asObservable();
  }

  /**
   * Save a new dashboard version
   */
  saveVersion(
    dashboardId: string,
    layout: DashboardLayout,
    name?: string,
    description?: string,
    tags: string[] = []
  ): DashboardVersion {
    const previousVersions = this.getVersionsByDashboard(dashboardId);
    const versionNumber = previousVersions.length + 1;
    
    // Calculate changes
    const previousVersion = this.getActiveVersion(dashboardId);
    const changesSummary = this.calculateChanges(previousVersion?.layout, layout);

    const version: DashboardVersion = {
      id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dashboardId,
      version: versionNumber,
      name: name || `Version ${versionNumber}`,
      description: description || `Auto-saved version ${versionNumber}`,
      layout: JSON.parse(JSON.stringify(layout)), // Deep clone
      createdBy: this.getCurrentUserId(),
      createdAt: new Date(),
      tags,
      isActive: true,
      metadata: {
        widgetCount: layout.widgets.length,
        changeType: versionNumber === 1 ? 'created' : 'updated',
        changesSummary
      }
    };

    // Mark all other versions as inactive
    this.versions
      .filter(v => v.dashboardId === dashboardId)
      .forEach(v => v.isActive = false);

    // Add new version
    this.versions.unshift(version);

    // Keep only MAX_VERSIONS per dashboard
    this.cleanupOldVersions(dashboardId);

    this.saveVersions();
    this.versionsSubject.next(this.versions);

    console.log(`Saved dashboard version ${versionNumber} for ${dashboardId}`);
    return version;
  }

  /**
   * Rollback to a specific version
   */
  rollbackToVersion(versionId: string): DashboardVersion | null {
    const targetVersion = this.versions.find(v => v.id === versionId);
    if (!targetVersion) {
      console.error(`Version ${versionId} not found`);
      return null;
    }

    // Create a new version from the rolled-back state
    const restoredVersion = this.saveVersion(
      targetVersion.dashboardId,
      targetVersion.layout,
      `Restored from v${targetVersion.version}`,
      `Rolled back to version ${targetVersion.version} (${targetVersion.name})`,
      ['rollback', ...targetVersion.tags]
    );

    restoredVersion.metadata.changeType = 'restored';

    this.saveVersions();
    this.versionsSubject.next(this.versions);

    console.log(`Rolled back to version ${targetVersion.version}`);
    return restoredVersion;
  }

  /**
   * Get all versions for a dashboard
   */
  getVersionsByDashboard(dashboardId: string): DashboardVersion[] {
    return this.versions
      .filter(v => v.dashboardId === dashboardId)
      .sort((a, b) => b.version - a.version);
  }

  /**
   * Get active version for a dashboard
   */
  getActiveVersion(dashboardId: string): DashboardVersion | null {
    return this.versions.find(v => v.dashboardId === dashboardId && v.isActive) || null;
  }

  /**
   * Get version by ID
   */
  getVersion(versionId: string): DashboardVersion | undefined {
    return this.versions.find(v => v.id === versionId);
  }

  /**
   * Get version history for a dashboard
   */
  getHistory(dashboardId: string): VersionHistory {
    const versions = this.getVersionsByDashboard(dashboardId);
    const activeVersion = this.getActiveVersion(dashboardId);

    return {
      dashboardId,
      versions,
      activeVersion
    };
  }

  /**
   * Compare two versions
   */
  compareVersions(versionId1: string, versionId2: string): VersionComparison | null {
    const v1 = this.getVersion(versionId1);
    const v2 = this.getVersion(versionId2);

    if (!v1 || !v2) {
      return null;
    }

    return this.compareLayouts(v1.layout, v2.layout);
  }

  /**
   * Delete a version
   */
  deleteVersion(versionId: string): boolean {
    const index = this.versions.findIndex(v => v.id === versionId);
    if (index === -1) {
      return false;
    }

    const version = this.versions[index];
    
    // Don't allow deleting the active version
    if (version.isActive) {
      console.error('Cannot delete active version');
      return false;
    }

    this.versions.splice(index, 1);
    this.saveVersions();
    this.versionsSubject.next(this.versions);

    console.log(`Deleted version ${version.version}`);
    return true;
  }

  /**
   * Tag a version
   */
  tagVersion(versionId: string, tag: string): void {
    const version = this.versions.find(v => v.id === versionId);
    if (version && !version.tags.includes(tag)) {
      version.tags.push(tag);
      this.saveVersions();
      this.versionsSubject.next(this.versions);
    }
  }

  /**
   * Remove tag from version
   */
  removeTag(versionId: string, tag: string): void {
    const version = this.versions.find(v => v.id === versionId);
    if (version) {
      version.tags = version.tags.filter(t => t !== tag);
      this.saveVersions();
      this.versionsSubject.next(this.versions);
    }
  }

  /**
   * Get versions by tag
   */
  getVersionsByTag(tag: string): DashboardVersion[] {
    return this.versions.filter(v => v.tags.includes(tag));
  }

  /**
   * Export version history to JSON
   */
  exportHistory(dashboardId: string): string {
    const history = this.getHistory(dashboardId);
    return JSON.stringify(history, null, 2);
  }

  /**
   * Get statistics for a dashboard
   */
  getStatistics(dashboardId: string): {
    totalVersions: number;
    oldestVersion: Date | null;
    newestVersion: Date | null;
    averageWidgetCount: number;
    tagCounts: { [tag: string]: number };
  } {
    const versions = this.getVersionsByDashboard(dashboardId);

    if (versions.length === 0) {
      return {
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        averageWidgetCount: 0,
        tagCounts: {}
      };
    }

    const sorted = [...versions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const totalWidgets = versions.reduce((sum, v) => sum + v.metadata.widgetCount, 0);
    
    const tagCounts: { [tag: string]: number } = {};
    versions.forEach(v => {
      v.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return {
      totalVersions: versions.length,
      oldestVersion: sorted[0].createdAt,
      newestVersion: sorted[sorted.length - 1].createdAt,
      averageWidgetCount: Math.round(totalWidgets / versions.length),
      tagCounts
    };
  }

  /**
   * Auto-save current state
   */
  autoSave(dashboardId: string, layout: DashboardLayout): void {
    const lastVersion = this.getActiveVersion(dashboardId);
    
    // Don't auto-save if nothing changed
    if (lastVersion && this.areLayoutsEqual(lastVersion.layout, layout)) {
      return;
    }

    // Check if last auto-save was recent (within 5 minutes)
    if (lastVersion && lastVersion.tags.includes('auto-save')) {
      const timeSinceLastSave = Date.now() - lastVersion.createdAt.getTime();
      if (timeSinceLastSave < 5 * 60 * 1000) {
        return; // Don't auto-save too frequently
      }
    }

    this.saveVersion(
      dashboardId,
      layout,
      'Auto-save',
      'Automatically saved',
      ['auto-save']
    );
  }

  // Private helper methods

  private calculateChanges(oldLayout: DashboardLayout | undefined, newLayout: DashboardLayout): string[] {
    const changes: string[] = [];

    if (!oldLayout) {
      changes.push('Dashboard created');
      changes.push(`${newLayout.widgets.length} widgets added`);
      return changes;
    }

    // Check widget count changes
    const oldCount = oldLayout.widgets.length;
    const newCount = newLayout.widgets.length;
    
    if (newCount > oldCount) {
      changes.push(`${newCount - oldCount} widget(s) added`);
    } else if (newCount < oldCount) {
      changes.push(`${oldCount - newCount} widget(s) removed`);
    }

    // Check for repositioned widgets
    const repositioned = newLayout.widgets.filter(nw => {
      const ow = oldLayout.widgets.find(w => w.id === nw.id);
      return ow && (ow.position.row !== nw.position.row || ow.position.col !== nw.position.col);
    });

    if (repositioned.length > 0) {
      changes.push(`${repositioned.length} widget(s) repositioned`);
    }

    // Check for resized widgets
    const resized = newLayout.widgets.filter(nw => {
      const ow = oldLayout.widgets.find(w => w.id === nw.id);
      return ow && (ow.size.width !== nw.size.width || ow.size.height !== nw.size.height);
    });

    if (resized.length > 0) {
      changes.push(`${resized.length} widget(s) resized`);
    }

    // Check visibility changes
    const visibilityChanged = newLayout.widgets.filter(nw => {
      const ow = oldLayout.widgets.find(w => w.id === nw.id);
      return ow && ow.visible !== nw.visible;
    });

    if (visibilityChanged.length > 0) {
      changes.push(`${visibilityChanged.length} widget(s) visibility changed`);
    }

    if (changes.length === 0) {
      changes.push('Minor changes');
    }

    return changes;
  }

  private compareLayouts(layout1: DashboardLayout, layout2: DashboardLayout): VersionComparison {
    const widgets1 = layout1.widgets;
    const widgets2 = layout2.widgets;

    const added = widgets2.filter(w2 => !widgets1.find(w1 => w1.id === w2.id));
    const removed = widgets1.filter(w1 => !widgets2.find(w2 => w2.id === w1.id));
    
    const common1 = widgets1.filter(w1 => widgets2.find(w2 => w2.id === w1.id));
    const common2 = widgets2.filter(w2 => widgets1.find(w1 => w1.id === w2.id));
    
    const modified = common2.filter(w2 => {
      const w1 = common1.find(w => w.id === w2.id);
      return w1 && !this.areWidgetsEqual(w1, w2);
    });

    const unchanged = common2.filter(w2 => {
      const w1 = common1.find(w => w.id === w2.id);
      return w1 && this.areWidgetsEqual(w1, w2);
    });

    return { added, removed, modified, unchanged };
  }

  private areLayoutsEqual(layout1: DashboardLayout, layout2: DashboardLayout): boolean {
    if (layout1.widgets.length !== layout2.widgets.length) {
      return false;
    }

    return layout1.widgets.every(w1 => {
      const w2 = layout2.widgets.find(w => w.id === w1.id);
      return w2 && this.areWidgetsEqual(w1, w2);
    });
  }

  private areWidgetsEqual(w1: any, w2: any): boolean {
    return (
      w1.type === w2.type &&
      w1.position.row === w2.position.row &&
      w1.position.col === w2.position.col &&
      w1.size.width === w2.size.width &&
      w1.size.height === w2.size.height &&
      w1.visible === w2.visible
    );
  }

  private cleanupOldVersions(dashboardId: string): void {
    const versions = this.getVersionsByDashboard(dashboardId);
    
    if (versions.length > this.MAX_VERSIONS) {
      // Keep the active version and the most recent MAX_VERSIONS
      const toKeep = new Set([
        ...versions.filter(v => v.isActive).map(v => v.id),
        ...versions.slice(0, this.MAX_VERSIONS).map(v => v.id)
      ]);

      this.versions = this.versions.filter(v => 
        v.dashboardId !== dashboardId || toKeep.has(v.id)
      );

      console.log(`Cleaned up old versions for ${dashboardId}`);
    }
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('current_user_id') || 'user-1';
  }

  private saveVersions(): void {
    // Only save recent versions to localStorage (last 100)
    const recentVersions = this.versions.slice(0, 100);
    localStorage.setItem(this.VERSIONS_KEY, JSON.stringify(recentVersions));
  }

  private loadVersions(): void {
    const saved = localStorage.getItem(this.VERSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.versions = parsed.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }));
    }
  }
}

