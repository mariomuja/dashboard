import { TestBed } from '@angular/core/testing';
import { DashboardVersionControlService, DashboardVersion } from '../../../app/services/dashboard-version-control.service';
import { DashboardLayout } from '../../../app/dashboard-layout.service';

describe('DashboardVersionControlService', () => {
  let service: DashboardVersionControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardVersionControlService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveVersion', () => {
    it('should save a new version', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const version = service.saveVersion('test-dashboard', layout, 'v1', 'First version');

      expect(version).toBeDefined();
      expect(version.version).toBe(1);
      expect(version.name).toBe('v1');
      expect(version.description).toBe('First version');
      expect(version.isActive).toBe(true);
    });

    it('should increment version number', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const v1 = service.saveVersion('test-dashboard', layout);
      const v2 = service.saveVersion('test-dashboard', layout);

      expect(v1.version).toBe(1);
      expect(v2.version).toBe(2);
    });

    it('should mark previous version as inactive', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const v1 = service.saveVersion('test-dashboard', layout);
      const v2 = service.saveVersion('test-dashboard', layout);

      const versions = service.getVersionsByDashboard('test-dashboard');
      const oldV1 = versions.find(v => v.id === v1.id);

      expect(oldV1?.isActive).toBe(false);
      expect(v2.isActive).toBe(true);
    });

    it('should include tags', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const version = service.saveVersion(
        'test-dashboard',
        layout,
        'v1',
        'desc',
        ['tag1', 'tag2']
      );

      expect(version.tags).toEqual(['tag1', 'tag2']);
    });

    it('should calculate changes summary', () => {
      const layout1: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const layout2: DashboardLayout = {
        name: 'Test',
        widgets: [
          { id: 'w1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 6, height: 2 }, visible: true }
        ]
      };

      service.saveVersion('test-dashboard', layout1);
      const v2 = service.saveVersion('test-dashboard', layout2);

      expect(v2.metadata.changesSummary).toContain('1 widget(s) added');
    });
  });

  describe('rollbackToVersion', () => {
    it('should rollback to a specific version', () => {
      const layout1: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const layout2: DashboardLayout = {
        name: 'Test',
        widgets: [
          { id: 'w1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 6, height: 2 }, visible: true }
        ]
      };

      const v1 = service.saveVersion('test-dashboard', layout1);
      service.saveVersion('test-dashboard', layout2);

      const restored = service.rollbackToVersion(v1.id);

      expect(restored).toBeDefined();
      expect(restored?.metadata.changeType).toBe('restored');
      expect(restored?.layout.widgets.length).toBe(0);
    });

    it('should return null for invalid version ID', () => {
      const restored = service.rollbackToVersion('invalid-id');
      expect(restored).toBeNull();
    });

    it('should create new version with restored changeType', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const v1 = service.saveVersion('test-dashboard', layout);
      const restored = service.rollbackToVersion(v1.id);

      expect(restored?.metadata.changeType).toBe('restored');
    });
  });

  describe('getVersionsByDashboard', () => {
    it('should return versions sorted by version number descending', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      service.saveVersion('test-dashboard', layout);
      service.saveVersion('test-dashboard', layout);
      service.saveVersion('test-dashboard', layout);

      const versions = service.getVersionsByDashboard('test-dashboard');

      expect(versions.length).toBe(3);
      expect(versions[0].version).toBe(3);
      expect(versions[1].version).toBe(2);
      expect(versions[2].version).toBe(1);
    });

    it('should return empty array for unknown dashboard', () => {
      const versions = service.getVersionsByDashboard('unknown');
      expect(versions).toEqual([]);
    });
  });

  describe('getActiveVersion', () => {
    it('should return the active version', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      service.saveVersion('test-dashboard', layout);
      const v2 = service.saveVersion('test-dashboard', layout);

      const active = service.getActiveVersion('test-dashboard');

      expect(active?.id).toBe(v2.id);
      expect(active?.isActive).toBe(true);
    });

    it('should return null if no active version', () => {
      const active = service.getActiveVersion('unknown');
      expect(active).toBeNull();
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions', () => {
      const layout1: DashboardLayout = {
        name: 'Test',
        widgets: [
          { id: 'w1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 6, height: 2 }, visible: true }
        ]
      };

      const layout2: DashboardLayout = {
        name: 'Test',
        widgets: [
          { id: 'w1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 6, height: 2 }, visible: true },
          { id: 'w2', type: 'kpi', position: { row: 1, col: 0 }, size: { width: 6, height: 2 }, visible: true }
        ]
      };

      const v1 = service.saveVersion('test-dashboard', layout1);
      const v2 = service.saveVersion('test-dashboard', layout2);

      const comparison = service.compareVersions(v1.id, v2.id);

      expect(comparison).toBeDefined();
      expect(comparison?.added.length).toBe(1);
      expect(comparison?.removed.length).toBe(0);
      expect(comparison?.unchanged.length).toBe(1);
    });

    it('should return null for invalid version IDs', () => {
      const comparison = service.compareVersions('invalid1', 'invalid2');
      expect(comparison).toBeNull();
    });
  });

  describe('deleteVersion', () => {
    it('should delete a version', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const v1 = service.saveVersion('test-dashboard', layout);
      service.saveVersion('test-dashboard', layout);

      const success = service.deleteVersion(v1.id);

      expect(success).toBe(true);
      expect(service.getVersion(v1.id)).toBeUndefined();
    });

    it('should not delete active version', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const v1 = service.saveVersion('test-dashboard', layout);

      const success = service.deleteVersion(v1.id);

      expect(success).toBe(false);
      expect(service.getVersion(v1.id)).toBeDefined();
    });

    it('should return false for invalid version ID', () => {
      const success = service.deleteVersion('invalid');
      expect(success).toBe(false);
    });
  });

  describe('tagVersion', () => {
    it('should add a tag to version', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const version = service.saveVersion('test-dashboard', layout);
      service.tagVersion(version.id, 'production');

      const updated = service.getVersion(version.id);
      expect(updated?.tags).toContain('production');
    });

    it('should not add duplicate tags', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const version = service.saveVersion('test-dashboard', layout);
      service.tagVersion(version.id, 'production');
      service.tagVersion(version.id, 'production');

      const updated = service.getVersion(version.id);
      const productionTags = updated?.tags.filter(t => t === 'production');
      expect(productionTags?.length).toBe(1);
    });
  });

  describe('removeTag', () => {
    it('should remove a tag from version', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const version = service.saveVersion('test-dashboard', layout, 'v1', 'desc', ['tag1', 'tag2']);
      service.removeTag(version.id, 'tag1');

      const updated = service.getVersion(version.id);
      expect(updated?.tags).not.toContain('tag1');
      expect(updated?.tags).toContain('tag2');
    });
  });

  describe('getVersionsByTag', () => {
    it('should return versions with specific tag', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      service.saveVersion('test-dashboard', layout, 'v1', 'desc', ['production']);
      service.saveVersion('test-dashboard', layout, 'v2', 'desc', ['dev']);
      service.saveVersion('test-dashboard', layout, 'v3', 'desc', ['production']);

      const prodVersions = service.getVersionsByTag('production');
      expect(prodVersions.length).toBe(2);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics for dashboard', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: [
          { id: 'w1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 6, height: 2 }, visible: true }
        ]
      };

      service.saveVersion('test-dashboard', layout, 'v1', 'desc', ['tag1']);
      service.saveVersion('test-dashboard', layout, 'v2', 'desc', ['tag1', 'tag2']);

      const stats = service.getStatistics('test-dashboard');

      expect(stats.totalVersions).toBe(2);
      expect(stats.averageWidgetCount).toBe(1);
      expect(stats.tagCounts['tag1']).toBe(2);
      expect(stats.tagCounts['tag2']).toBe(1);
    });

    it('should return zero statistics for unknown dashboard', () => {
      const stats = service.getStatistics('unknown');

      expect(stats.totalVersions).toBe(0);
      expect(stats.oldestVersion).toBeNull();
      expect(stats.newestVersion).toBeNull();
      expect(stats.averageWidgetCount).toBe(0);
    });
  });

  describe('autoSave', () => {
    it('should not save if layout unchanged', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      service.saveVersion('test-dashboard', layout);
      const versionsBefore = service.getVersionsByDashboard('test-dashboard').length;

      service.autoSave('test-dashboard', layout);
      const versionsAfter = service.getVersionsByDashboard('test-dashboard').length;

      expect(versionsAfter).toBe(versionsBefore);
    });

    it('should save if layout changed', () => {
      const layout1: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const layout2: DashboardLayout = {
        name: 'Test',
        widgets: [
          { id: 'w1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 6, height: 2 }, visible: true }
        ]
      };

      service.saveVersion('test-dashboard', layout1);
      const versionsBefore = service.getVersionsByDashboard('test-dashboard').length;

      service.autoSave('test-dashboard', layout2);
      const versionsAfter = service.getVersionsByDashboard('test-dashboard').length;

      expect(versionsAfter).toBe(versionsBefore + 1);
    });

    it('should add auto-save tag', () => {
      const layout1: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      const layout2: DashboardLayout = {
        name: 'Test',
        widgets: [
          { id: 'w1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 6, height: 2 }, visible: true }
        ]
      };

      service.saveVersion('test-dashboard', layout1);
      service.autoSave('test-dashboard', layout2);

      const active = service.getActiveVersion('test-dashboard');
      expect(active?.tags).toContain('auto-save');
    });
  });

  describe('exportHistory', () => {
    it('should export history as JSON string', () => {
      const layout: DashboardLayout = {
        name: 'Test',
        widgets: []
      };

      service.saveVersion('test-dashboard', layout);
      const json = service.exportHistory('test-dashboard');

      expect(json).toBeTruthy();
      const parsed = JSON.parse(json);
      expect(parsed.dashboardId).toBe('test-dashboard');
      expect(parsed.versions).toBeDefined();
    });
  });
});

