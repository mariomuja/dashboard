# Dashboard Version Control Guide

## 📋 Overview

Complete version control system for dashboards with save, rollback, and change history tracking - similar to Git for your dashboards!

---

## ✨ Features

### ✅ Version Management
- 💾 **Save Versions** - Manually save dashboard states
- 🔄 **Auto-Save** - Automatic periodic saves
- 📝 **Version Naming** - Custom names and descriptions
- 🏷️ **Tags** - Organize versions with tags
- 📊 **Metadata** - Track widget count, change types

### ✅ Rollback Capability
- ⏮️ **Restore Previous** - Roll back to any version
- 🔍 **Preview Before Restore** - See what will change
- ✅ **One-Click Rollback** - Instant restoration
- 📜 **Rollback History** - Track all rollbacks

### ✅ Change History
- 📝 **Change Tracking** - What changed between versions
- 📊 **Change Summary** - Widgets added/removed/modified
- 👤 **User Tracking** - Who made each change
- ⏰ **Timestamps** - When changes occurred
- 📈 **Statistics** - Version analytics

### ✅ Advanced Features
- 🔀 **Version Comparison** - Compare any two versions
- 📤 **Export History** - Export to JSON
- 🗑️ **Version Cleanup** - Auto-cleanup old versions
- 🔍 **Search & Filter** - Find versions by tag/date
- 📊 **Version Analytics** - Statistics dashboard

---

## 🚀 Quick Start

### 1. Import Service

```typescript
import { DashboardVersionControlService } from './services/dashboard-version-control.service';

constructor(
  private versionControl: DashboardVersionControlService
) {}
```

### 2. Save a Version

```typescript
// Manual save
const version = this.versionControl.saveVersion(
  'dashboard-1',
  currentLayout,
  'Release v1.0',
  'Added new sales widgets',
  ['release', 'production']
);

console.log(`Saved version ${version.version}`);
```

### 3. Rollback to Version

```typescript
// Rollback to specific version
const restoredVersion = this.versionControl.rollbackToVersion(versionId);

if (restoredVersion) {
  console.log(`Rolled back to version ${restoredVersion.version}`);
  // Apply the layout
  this.applyLayout(restoredVersion.layout);
}
```

### 4. View History

```typescript
// Get version history
const history = this.versionControl.getHistory('dashboard-1');

console.log(`Total versions: ${history.versions.length}`);
console.log(`Active version: ${history.activeVersion?.version}`);
```

---

## 📚 API Reference

### Save Operations

#### `saveVersion(dashboardId, layout, name?, description?, tags?)`
Save a new dashboard version.

```typescript
const version = versionControl.saveVersion(
  'dashboard-1',
  layout,
  'Q4 2024 Layout',
  'Updated for quarterly review',
  ['quarterly', 'review']
);
```

**Returns:** `DashboardVersion` object

#### `autoSave(dashboardId, layout)`
Auto-save with duplicate detection (doesn't save if nothing changed).

```typescript
// Called periodically or on changes
versionControl.autoSave('dashboard-1', currentLayout);
```

**Features:**
- Detects if layout actually changed
- Prevents duplicate saves within 5 minutes
- Adds 'auto-save' tag automatically

### Rollback Operations

#### `rollbackToVersion(versionId)`
Rollback to a specific version.

```typescript
const restored = versionControl.rollbackToVersion('version-123');

if (restored) {
  // Apply the restored layout
  applyLayout(restored.layout);
}
```

**Returns:** New `DashboardVersion` (marked as 'restored') or `null`

### Query Operations

#### `getVersionsByDashboard(dashboardId)`
Get all versions for a dashboard (sorted newest first).

```typescript
const versions = versionControl.getVersionsByDashboard('dashboard-1');

versions.forEach(v => {
  console.log(`v${v.version}: ${v.name} - ${v.description}`);
});
```

#### `getActiveVersion(dashboardId)`
Get the currently active version.

```typescript
const active = versionControl.getActiveVersion('dashboard-1');

if (active) {
  console.log(`Active: v${active.version} - ${active.name}`);
}
```

#### `getVersion(versionId)`
Get specific version by ID.

```typescript
const version = versionControl.getVersion('version-123');

if (version) {
  console.log(`Version ${version.version}: ${version.name}`);
}
```

#### `getHistory(dashboardId)`
Get complete history for a dashboard.

```typescript
const history = versionControl.getHistory('dashboard-1');

console.log(`Versions: ${history.versions.length}`);
console.log(`Active: v${history.activeVersion?.version}`);
```

### Comparison Operations

#### `compareVersions(versionId1, versionId2)`
Compare two versions to see differences.

```typescript
const comparison = versionControl.compareVersions('version-1', 'version-2');

if (comparison) {
  console.log(`Added: ${comparison.added.length} widgets`);
  console.log(`Removed: ${comparison.removed.length} widgets`);
  console.log(`Modified: ${comparison.modified.length} widgets`);
  console.log(`Unchanged: ${comparison.unchanged.length} widgets`);
}
```

**Returns:** `VersionComparison` object or `null`

### Tag Operations

#### `tagVersion(versionId, tag)`
Add a tag to a version.

```typescript
versionControl.tagVersion('version-123', 'milestone');
versionControl.tagVersion('version-123', 'approved');
```

#### `removeTag(versionId, tag)`
Remove a tag from a version.

```typescript
versionControl.removeTag('version-123', 'draft');
```

#### `getVersionsByTag(tag)`
Find all versions with a specific tag.

```typescript
const milestones = versionControl.getVersionsByTag('milestone');
const releases = versionControl.getVersionsByTag('release');
```

### Delete Operations

#### `deleteVersion(versionId)`
Delete a version (cannot delete active version).

```typescript
const deleted = versionControl.deleteVersion('version-123');

if (deleted) {
  console.log('Version deleted');
} else {
  console.log('Cannot delete active version');
}
```

### Export Operations

#### `exportHistory(dashboardId)`
Export version history to JSON string.

```typescript
const json = versionControl.exportHistory('dashboard-1');

// Save to file or send to server
downloadFile(json, 'dashboard-history.json');
```

### Statistics Operations

#### `getStatistics(dashboardId)`
Get version analytics for a dashboard.

```typescript
const stats = versionControl.getStatistics('dashboard-1');

console.log(`Total versions: ${stats.totalVersions}`);
console.log(`Average widgets: ${stats.averageWidgetCount}`);
console.log(`First version: ${stats.oldestVersion}`);
console.log(`Latest version: ${stats.newestVersion}`);
console.log(`Tag usage:`, stats.tagCounts);
```

---

## 🎨 Data Structures

### DashboardVersion

```typescript
interface DashboardVersion {
  id: string;                    // Unique identifier
  dashboardId: string;           // Dashboard this version belongs to
  version: number;               // Version number (auto-incremented)
  name: string;                  // Version name
  description: string;           // Version description
  layout: DashboardLayout;       // Complete dashboard layout
  createdBy: string;             // User who created this version
  createdAt: Date;               // When version was created
  tags: string[];                // Tags for organization
  isActive: boolean;             // Is this the active version?
  metadata: {
    widgetCount: number;         // Number of widgets
    changeType: 'created' | 'updated' | 'restored';
    changesSummary: string[];    // List of changes
  };
}
```

### VersionComparison

```typescript
interface VersionComparison {
  added: any[];                  // Widgets added
  removed: any[];                // Widgets removed
  modified: any[];               // Widgets modified
  unchanged: any[];              // Widgets unchanged
}
```

### VersionHistory

```typescript
interface VersionHistory {
  dashboardId: string;           // Dashboard ID
  versions: DashboardVersion[];  // All versions
  activeVersion: DashboardVersion | null; // Currently active
}
```

---

## 💡 Use Cases

### 1. Development Workflow

```typescript
// During development
versionControl.saveVersion(
  'dashboard-1',
  layout,
  'Dev - Testing new layout',
  'Experimenting with widget positions',
  ['dev', 'experimental']
);

// Something broke? Rollback!
versionControl.rollbackToVersion(lastWorkingVersionId);
```

### 2. Release Management

```typescript
// Before deploying
versionControl.saveVersion(
  'dashboard-1',
  layout,
  'Release v2.0',
  'Q4 2024 production release',
  ['release', 'production', 'v2.0']
);

// Find all releases
const releases = versionControl.getVersionsByTag('release');
```

### 3. A/B Testing

```typescript
// Save variant A
const variantA = versionControl.saveVersion(
  'dashboard-1',
  layoutA,
  'A/B Test - Variant A',
  'Traditional layout',
  ['ab-test', 'variant-a']
);

// Save variant B
const variantB = versionControl.saveVersion(
  'dashboard-1',
  layoutB,
  'A/B Test - Variant B',
  'New experimental layout',
  ['ab-test', 'variant-b']
);

// Compare them
const comparison = versionControl.compareVersions(variantA.id, variantB.id);
```

### 4. Audit Trail

```typescript
// Get complete history
const history = versionControl.getHistory('dashboard-1');

history.versions.forEach(v => {
  console.log(`[${v.createdAt.toLocaleString()}] ${v.createdBy}`);
  console.log(`  v${v.version}: ${v.name}`);
  console.log(`  Changes: ${v.metadata.changesSummary.join(', ')}`);
});
```

### 5. Client Approval Workflow

```typescript
// Save draft for review
versionControl.saveVersion(
  'dashboard-1',
  layout,
  'Draft for Client Review',
  'Awaiting approval from client',
  ['draft', 'pending-approval']
);

// Client approves
versionControl.tagVersion(versionId, 'approved');

// Make it live
versionControl.tagVersion(versionId, 'production');
```

---

## 🔧 Integration Examples

### Integration with Dashboard Builder

```typescript
export class DashboardBuilderComponent {
  constructor(
    private layoutService: DashboardLayoutService,
    private versionControl: DashboardVersionControlService
  ) {}

  saveLayout(): void {
    const layout = this.layoutService.getCurrentLayout();
    
    // Save version
    const version = this.versionControl.saveVersion(
      'dashboard-1',
      layout,
      'User Changes',
      'Manual save by user'
    );
    
    // Update layout service
    this.layoutService.updateLayout(layout);
    
    alert(`Saved as version ${version.version}`);
  }

  loadVersionHistory(): void {
    const history = this.versionControl.getHistory('dashboard-1');
    this.versions = history.versions;
  }

  restoreVersion(versionId: string): void {
    if (confirm('Restore this version? Current changes will be saved first.')) {
      // Save current state
      this.saveLayout();
      
      // Restore
      const restored = this.versionControl.rollbackToVersion(versionId);
      
      if (restored) {
        this.layoutService.updateLayout(restored.layout);
        alert('Version restored successfully!');
      }
    }
  }
}
```

### Auto-Save Integration

```typescript
export class DashboardComponent implements OnInit, OnDestroy {
  private autoSaveInterval: any;
  
  ngOnInit(): void {
    // Auto-save every 5 minutes
    this.autoSaveInterval = setInterval(() => {
      const layout = this.layoutService.getCurrentLayout();
      this.versionControl.autoSave('dashboard-1', layout);
    }, 5 * 60 * 1000);
  }
  
  ngOnDestroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }
}
```

---

## 📊 Change Detection

The service automatically detects and summarizes changes:

### Detected Changes
- ✅ Widgets added
- ✅ Widgets removed
- ✅ Widgets repositioned
- ✅ Widgets resized
- ✅ Widget visibility changed

### Example Change Summary

```
[
  "2 widget(s) added",
  "1 widget(s) removed",
  "3 widget(s) repositioned",
  "2 widget(s) resized"
]
```

---

## 🎯 Best Practices

### 1. Version Naming
```typescript
// Good naming
"Release v2.0 - Q4 2024"
"Bug Fix - Chart alignment"
"Feature - Added sales widgets"

// Bad naming
"Version 1"
"Update"
"Changes"
```

### 2. Use Tags Effectively
```typescript
// Organize with tags
['production', 'release', 'v2.0']  // Production releases
['dev', 'experimental']            // Development versions
['approved', 'client-review']      // Approval workflow
['milestone', 'q4-2024']           // Time-based tags
```

### 3. Regular Cleanup
```typescript
// Service auto-cleans to MAX_VERSIONS (50)
// But you can manually manage:

// Delete old dev versions
const devVersions = versionControl.getVersionsByTag('dev');
devVersions.slice(10).forEach(v => {
  versionControl.deleteVersion(v.id);
});
```

### 4. Export Important Versions
```typescript
// Before major changes
const history = versionControl.exportHistory('dashboard-1');
saveToFile(history, `backup-${new Date().toISOString()}.json`);
```

---

## 🔍 Troubleshooting

### Version Not Saving
```typescript
// Check if layout actually changed
const active = versionControl.getActiveVersion('dashboard-1');
console.log('Last version:', active);

// Force save even if unchanged
const version = versionControl.saveVersion(
  'dashboard-1',
  layout,
  'Force Save',
  'Forced save for backup'
);
```

### Rollback Not Working
```typescript
// Ensure version exists
const version = versionControl.getVersion(versionId);
if (!version) {
  console.error('Version not found');
  return;
}

// Check if you have permission
if (version.isActive) {
  console.error('Cannot delete active version');
}
```

### Too Many Versions
```typescript
// Service keeps last 50 versions per dashboard
// Check statistics
const stats = versionControl.getStatistics('dashboard-1');
console.log(`Total versions: ${stats.totalVersions}`);

// Export old versions before they're cleaned up
if (stats.totalVersions > 40) {
  const history = versionControl.exportHistory('dashboard-1');
  saveBackup(history);
}
```

---

## 📈 Statistics Example

```typescript
const stats = versionControl.getStatistics('dashboard-1');

/*
Output:
{
  totalVersions: 25,
  oldestVersion: 2024-01-01T10:00:00.000Z,
  newestVersion: 2024-12-03T15:30:00.000Z,
  averageWidgetCount: 8,
  tagCounts: {
    'production': 5,
    'dev': 12,
    'release': 5,
    'auto-save': 10,
    'approved': 3
  }
}
*/
```

---

## ✅ Features Summary

- ✅ **50 versions** per dashboard (configurable)
- ✅ **Auto-save** with 5-minute cooldown
- ✅ **Change detection** and summary
- ✅ **Tag system** for organization
- ✅ **Version comparison** with diff
- ✅ **Rollback protection** (can't delete active)
- ✅ **Export** to JSON
- ✅ **Statistics** and analytics
- ✅ **localStorage** persistence
- ✅ **Observable** state management

---

## 🚀 Production Tips

1. **Backend Integration**: For production, store versions in a database instead of localStorage
2. **Compression**: Compress layout JSON before storing
3. **Retention Policy**: Set appropriate MAX_VERSIONS based on usage
4. **Access Control**: Add permission checks before rollback
5. **Notifications**: Notify users of auto-saves and rollbacks
6. **Sync**: Sync versions across devices/users
7. **Conflict Resolution**: Handle concurrent edits

---

## 🎉 Complete Implementation

The Dashboard Version Control system is **fully implemented** and ready to use:

- ✅ Save dashboard versions
- ✅ Rollback capability
- ✅ Change history tracking
- ✅ Version comparison
- ✅ Auto-save functionality
- ✅ Tag management
- ✅ Export/import
- ✅ Statistics and analytics
- ✅ Full documentation

**Start versioning your dashboards today!** 📊🔄

