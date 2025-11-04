import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { DashboardVersionHistoryComponent } from '../../../../app/components/dashboard-version-history/dashboard-version-history.component';
import { DashboardVersionControlService, DashboardVersion } from '../../../../app/services/dashboard-version-control.service';
import { DashboardLayoutService } from '../../../../app/services/dashboard-layout.service';

describe('DashboardVersionHistoryComponent', () => {
  let component: DashboardVersionHistoryComponent;
  let fixture: ComponentFixture<DashboardVersionHistoryComponent>;
  let versionControlService: jasmine.SpyObj<DashboardVersionControlService>;
  let layoutService: jasmine.SpyObj<DashboardLayoutService>;

  const mockVersion: DashboardVersion = {
    id: 'v1',
    dashboardId: 'test-dashboard',
    version: 1,
    name: 'Test Version',
    description: 'Test Description',
    layout: { name: 'Test', widgets: [] },
    createdBy: 'user-1',
    createdAt: new Date(),
    tags: ['test'],
    isActive: true,
    metadata: {
      widgetCount: 0,
      changeType: 'created',
      changesSummary: ['Dashboard created']
    }
  };

  beforeEach(async () => {
    const versionControlSpy = jasmine.createSpyObj('DashboardVersionControlService', [
      'getVersionsByDashboard',
      'getStatistics',
      'rollbackToVersion',
      'deleteVersion',
      'compareVersions',
      'tagVersion',
      'removeTag',
      'exportHistory'
    ]);

    const layoutSpy = jasmine.createSpyObj('DashboardLayoutService', ['updateLayout']);

    await TestBed.configureTestingModule({
      declarations: [ DashboardVersionHistoryComponent ],
      imports: [ RouterTestingModule, FormsModule ],
      providers: [
        { provide: DashboardVersionControlService, useValue: versionControlSpy },
        { provide: DashboardLayoutService, useValue: layoutSpy }
      ]
    }).compileComponents();

    versionControlService = TestBed.inject(DashboardVersionControlService) as jasmine.SpyObj<DashboardVersionControlService>;
    layoutService = TestBed.inject(DashboardLayoutService) as jasmine.SpyObj<DashboardLayoutService>;

    fixture = TestBed.createComponent(DashboardVersionHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load versions and statistics', () => {
      versionControlService.getVersionsByDashboard.and.returnValue([mockVersion]);
      versionControlService.getStatistics.and.returnValue({
        totalVersions: 1,
        oldestVersion: new Date(),
        newestVersion: new Date(),
        averageWidgetCount: 0,
        tagCounts: { test: 1 }
      });

      component.ngOnInit();

      expect(versionControlService.getVersionsByDashboard).toHaveBeenCalledWith('dashboard-main');
      expect(versionControlService.getStatistics).toHaveBeenCalledWith('dashboard-main');
      expect(component.versions.length).toBe(1);
      expect(component.statistics).toBeDefined();
    });
  });

  describe('filteredVersions', () => {
    beforeEach(() => {
      component.versions = [
        { ...mockVersion, id: 'v1', tags: ['production'] },
        { ...mockVersion, id: 'v2', tags: ['dev'] },
        { ...mockVersion, id: 'v3', name: 'Special Version', tags: ['production'] }
      ];
    });

    it('should return all versions when no filter', () => {
      const filtered = component.filteredVersions;
      expect(filtered.length).toBe(3);
    });

    it('should filter by tag', () => {
      component.filterTag = 'production';
      const filtered = component.filteredVersions;
      expect(filtered.length).toBe(2);
    });

    it('should filter by search query', () => {
      component.searchQuery = 'special';
      const filtered = component.filteredVersions;
      expect(filtered.length).toBe(1);
    });

    it('should filter by both tag and search', () => {
      component.filterTag = 'production';
      component.searchQuery = 'special';
      const filtered = component.filteredVersions;
      expect(filtered.length).toBe(1);
    });
  });

  describe('allTags', () => {
    it('should return unique sorted tags', () => {
      component.versions = [
        { ...mockVersion, tags: ['production', 'release'] },
        { ...mockVersion, tags: ['dev', 'production'] },
        { ...mockVersion, tags: ['dev'] }
      ];

      const tags = component.allTags;
      expect(tags).toEqual(['dev', 'production', 'release']);
    });
  });

  describe('rollbackToVersion', () => {
    it('should rollback version and reload', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      versionControlService.rollbackToVersion.and.returnValue({
        ...mockVersion,
        version: 2
      });
      versionControlService.getVersionsByDashboard.and.returnValue([]);
      versionControlService.getStatistics.and.returnValue({
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        averageWidgetCount: 0,
        tagCounts: {}
      });

      component.rollbackToVersion(mockVersion);

      expect(window.confirm).toHaveBeenCalled();
      expect(versionControlService.rollbackToVersion).toHaveBeenCalledWith(mockVersion.id);
      expect(layoutService.updateLayout).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalled();
    });

    it('should not rollback if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.rollbackToVersion(mockVersion);

      expect(versionControlService.rollbackToVersion).not.toHaveBeenCalled();
    });

    it('should show error if rollback fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      versionControlService.rollbackToVersion.and.returnValue(null);

      component.rollbackToVersion(mockVersion);

      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Failed'));
    });
  });

  describe('deleteVersion', () => {
    it('should not delete active version', () => {
      spyOn(window, 'alert');
      const activeVersion = { ...mockVersion, isActive: true };

      component.deleteVersion(activeVersion);

      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Cannot delete'));
      expect(versionControlService.deleteVersion).not.toHaveBeenCalled();
    });

    it('should delete version if confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      versionControlService.deleteVersion.and.returnValue(true);
      versionControlService.getVersionsByDashboard.and.returnValue([]);
      versionControlService.getStatistics.and.returnValue({
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        averageWidgetCount: 0,
        tagCounts: {}
      });
      const inactiveVersion = { ...mockVersion, isActive: false };

      component.deleteVersion(inactiveVersion);

      expect(window.confirm).toHaveBeenCalled();
      expect(versionControlService.deleteVersion).toHaveBeenCalledWith(inactiveVersion.id);
      expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('deleted successfully'));
    });

    it('should not delete if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const inactiveVersion = { ...mockVersion, isActive: false };

      component.deleteVersion(inactiveVersion);

      expect(versionControlService.deleteVersion).not.toHaveBeenCalled();
    });
  });

  describe('toggleCompareMode', () => {
    it('should toggle compare mode', () => {
      expect(component.showCompareMode).toBe(false);

      component.toggleCompareMode();
      expect(component.showCompareMode).toBe(true);

      component.toggleCompareMode();
      expect(component.showCompareMode).toBe(false);
    });

    it('should reset comparison state when toggling off', () => {
      component.showCompareMode = true;
      component.compareVersion1 = mockVersion;
      component.compareVersion2 = mockVersion;
      component.comparison = { added: [], removed: [], modified: [], unchanged: [] };

      component.toggleCompareMode();

      expect(component.compareVersion1).toBeNull();
      expect(component.compareVersion2).toBeNull();
      expect(component.comparison).toBeNull();
    });
  });

  describe('selectForComparison', () => {
    it('should select first version', () => {
      component.showCompareMode = true;

      component.selectForComparison(mockVersion);

      expect(component.compareVersion1).toBe(mockVersion);
      expect(component.compareVersion2).toBeNull();
    });

    it('should select second version and compare', () => {
      const version2 = { ...mockVersion, id: 'v2' };
      component.showCompareMode = true;
      component.compareVersion1 = mockVersion;
      versionControlService.compareVersions.and.returnValue({
        added: [],
        removed: [],
        modified: [],
        unchanged: []
      });

      component.selectForComparison(version2);

      expect(component.compareVersion2).toBe(version2);
      expect(versionControlService.compareVersions).toHaveBeenCalled();
    });

    it('should reset if same version selected', () => {
      component.showCompareMode = true;
      component.compareVersion1 = mockVersion;
      component.compareVersion2 = { ...mockVersion, id: 'v2' };

      component.selectForComparison(mockVersion);

      expect(component.compareVersion1).toBe(mockVersion);
      expect(component.compareVersion2).toBeNull();
    });
  });

  describe('addTag', () => {
    it('should add tag to version', () => {
      spyOn(window, 'prompt').and.returnValue('new-tag');
      versionControlService.getVersionsByDashboard.and.returnValue([]);
      versionControlService.getStatistics.and.returnValue({
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        averageWidgetCount: 0,
        tagCounts: {}
      });

      component.addTag(mockVersion);

      expect(window.prompt).toHaveBeenCalled();
      expect(versionControlService.tagVersion).toHaveBeenCalledWith(mockVersion.id, 'new-tag');
    });

    it('should not add tag if cancelled', () => {
      spyOn(window, 'prompt').and.returnValue(null);

      component.addTag(mockVersion);

      expect(versionControlService.tagVersion).not.toHaveBeenCalled();
    });
  });

  describe('removeTag', () => {
    it('should remove tag from version', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      versionControlService.getVersionsByDashboard.and.returnValue([]);
      versionControlService.getStatistics.and.returnValue({
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        averageWidgetCount: 0,
        tagCounts: {}
      });

      component.removeTag(mockVersion, 'test');

      expect(window.confirm).toHaveBeenCalled();
      expect(versionControlService.removeTag).toHaveBeenCalledWith(mockVersion.id, 'test');
    });

    it('should not remove tag if cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.removeTag(mockVersion, 'test');

      expect(versionControlService.removeTag).not.toHaveBeenCalled();
    });
  });

  describe('exportHistory', () => {
    it('should export history as JSON file', () => {
      const mockJson = '{"test": "data"}';
      versionControlService.exportHistory.and.returnValue(mockJson);
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(window.URL, 'revokeObjectURL');
      
      const createElementSpy = spyOn(document, 'createElement').and.returnValue({
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      } as any);

      component.exportHistory();

      expect(versionControlService.exportHistory).toHaveBeenCalledWith('dashboard-main');
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('helper methods', () => {
    it('should format date', () => {
      const date = new Date('2024-01-01T12:00:00');
      const formatted = component.formatDate(date);
      expect(formatted).toBeTruthy();
    });

    it('should return correct change type icon', () => {
      expect(component.getChangeTypeIcon('created')).toBe('✨');
      expect(component.getChangeTypeIcon('updated')).toBe('📝');
      expect(component.getChangeTypeIcon('restored')).toBe('⏮️');
      expect(component.getChangeTypeIcon('other')).toBe('📄');
    });

    it('should return correct change type color', () => {
      expect(component.getChangeTypeColor('created')).toBe('#10b981');
      expect(component.getChangeTypeColor('updated')).toBe('#3b82f6');
      expect(component.getChangeTypeColor('restored')).toBe('#f59e0b');
      expect(component.getChangeTypeColor('other')).toBe('#6b7280');
    });

    it('should return tag count', () => {
      component.statistics = {
        totalVersions: 1,
        oldestVersion: new Date(),
        newestVersion: new Date(),
        averageWidgetCount: 0,
        tagCounts: { tag1: 1, tag2: 2, tag3: 3 }
      };

      expect(component.getTagCount()).toBe(3);
    });

    it('should return 0 for tag count if no statistics', () => {
      component.statistics = null;
      expect(component.getTagCount()).toBe(0);
    });
  });
});

