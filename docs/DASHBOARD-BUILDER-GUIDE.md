# Dashboard Builder Guide

## 🎨 Drag-and-Drop Dashboard Customization

The dashboard builder allows you to fully customize your dashboard layout with an intuitive drag-and-drop interface.

---

## 🚀 Quick Start

### Access the Builder:

1. Open your dashboard at `http://localhost:4200`
2. Click the **"🎨 Customize"** button in the header
3. You'll be taken to `/builder` where you can customize your layout

---

## ✨ Features

### 1. **Drag to Reorder**
- Grab the drag handle (⋮⋮) on the left of any widget
- Drag it up or down to reorder
- Drop it in the new position
- Changes save automatically

### 2. **Show/Hide Widgets**
- Click the eye icon (👁️) to hide a widget
- Click again (👁️‍🗨️) to show it
- Hidden widgets appear grayed out
- Your preferences are saved

### 3. **Add New Widgets**
- Click **"➕ Add Widget"** button
- Select from available widgets:
  - 📊 KPI Cards
  - 💰 Revenue Chart
  - 📈 Sales Chart
  - 📉 Conversion Chart
  - 🥧 Pie Chart
  - 🎯 Goal Tracker
  - 🤖 AI Insights
- Widget appears at the bottom
- Drag to position it where you want

### 4. **Remove Widgets**
- Click the trash icon (🗑️) on any widget
- Confirm deletion
- Widget is removed from your layout

### 5. **Apply Templates**
- Click **"📐 Templates"** button
- Choose from pre-built templates:
  - **Executive Summary** - High-level overview
  - **Sales Dashboard** - Sales-focused metrics
  - **Marketing Analytics** - Campaign tracking
  - **Complete Overview** - All widgets
- Click a template to apply it instantly

### 6. **Reset to Default**
- Click **"🔄 Reset"** button
- Confirms before resetting
- Restores the original dashboard layout

### 7. **Preview & Save**
- Click **"✓ Done"** or **"👀 Preview Dashboard"**
- Returns to main dashboard with your custom layout
- Layout is automatically saved to LocalStorage
- Persists across browser sessions

---

## 🎯 Use Cases

### For Executives:
1. Hide detailed charts
2. Show only KPIs and AI Insights
3. Apply "Executive Summary" template

### For Sales Teams:
1. Put Sales Chart at the top
2. Add Goal Tracker prominently
3. Hide conversion metrics

### For Marketing:
1. Highlight Conversion Chart
2. Show Pie Chart for category breakdown
3. Keep AI Insights visible

### For Analysts:
1. Show all widgets
2. Reorder by importance
3. Keep drill-down capabilities

---

## 🔧 Technical Details

### Storage:
- Layouts saved to browser LocalStorage
- Key: `dashboard_layout`
- Survives page refreshes
- Per-browser, per-user

### Data Structure:
```typescript
interface DashboardLayout {
  name: string;  // "Custom" or template name
  widgets: WidgetConfig[];
}

interface WidgetConfig {
  id: string;          // Unique identifier
  type: string;        // Widget type
  position: {          // Grid position
    row: number;
    col: number;
  };
  size: {              // Grid size
    width: number;
    height: number;
  };
  visible: boolean;    // Show/hide
}
```

### Services Used:
- `DashboardLayoutService` - Manages layouts
- `DashboardTemplatesService` - Provides templates

---

## 📋 Widget Types

| Type | Description | Icon |
|------|-------------|------|
| `kpi` | KPI Cards Grid | 📊 |
| `chart-revenue` | Revenue Line Chart | 💰 |
| `chart-sales` | Sales Bar Chart | 📈 |
| `chart-conversion` | Conversion Chart | 📉 |
| `pie` | Revenue by Category | 🥧 |
| `goals` | Goal Tracker | 🎯 |
| `insights` | AI Insights Panel | 🤖 |

---

## 🎨 Available Templates

### 1. Executive Summary
**Best for:** C-level executives, quick overview
**Includes:**
- KPI Cards
- Revenue Trend
- AI Insights

### 2. Sales Dashboard
**Best for:** Sales teams, revenue tracking
**Includes:**
- KPI Cards
- Sales Chart
- Pie Chart
- Goal Tracker

### 3. Marketing Analytics
**Best for:** Marketing teams, campaign analysis
**Includes:**
- KPI Cards
- Conversion Chart
- Revenue & Sales Charts

### 4. Complete Overview
**Best for:** Analysts, comprehensive view
**Includes:**
- All available widgets
- Full data visualization

---

## 💡 Tips & Tricks

### Tip 1: Start with a Template
Don't start from scratch - apply a template close to what you want, then customize.

### Tip 2: Hide, Don't Delete
Hide widgets you might need later instead of deleting them.

### Tip 3: Logical Order
Put your most important metrics at the top for quick access.

### Tip 4: Mobile Consideration
Remember the dashboard is responsive - widgets stack on mobile.

### Tip 5: Save Often
The builder auto-saves, but you can click "Done" to confirm and preview.

---

## 🔍 Keyboard Shortcuts

- **Esc** - Close template/widget picker
- **Tab** - Navigate between widgets
- **Enter** - Click focused button
- **Space** - Activate drag (when focused on handle)

---

## 🐛 Troubleshooting

### Layout Not Saving?
- Check browser LocalStorage isn't full
- Try clearing cache and rebuilding layout
- Use "Reset" to restore defaults

### Widget Not Appearing?
- Check it's marked as "visible"
- Try removing and re-adding it
- Apply a template and customize from there

### Drag Not Working?
- Make sure you're clicking the drag handle (⋮⋮)
- Try refreshing the page
- Check browser console for errors

---

## 🚀 Advanced Usage

### Programmatic Layout Changes:

```typescript
// Get layout service
constructor(private layoutService: DashboardLayoutService) {}

// Toggle widget visibility
this.layoutService.toggleWidgetVisibility('kpi-1');

// Get current layout
const layout = this.layoutService.getCurrentLayout();

// Update layout
this.layoutService.updateLayout(customLayout);

// Reset to default
this.layoutService.resetToDefault();

// Subscribe to layout changes
this.layoutService.currentLayout$.subscribe(layout => {
  console.log('Layout changed:', layout);
});
```

### Apply Template Programmatically:

```typescript
// Get templates service
constructor(private templatesService: DashboardTemplatesService) {}

// Get all templates
const templates = this.templatesService.getTemplates();

// Get specific template
const executive = this.templatesService.getTemplateById('executive-summary');

// Apply template
if (executive) {
  this.layoutService.updateLayout(executive.layout);
}
```

---

## 📊 Default Layout

The default layout includes all widgets in this order:
1. KPI Cards
2. Revenue Chart | Sales Chart (side-by-side)
3. Conversion Chart (full width)
4. Pie Chart
5. Goal Tracker
6. AI Insights Panel

---

## 🎯 Best Practices

### For Performance:
- Hide unused widgets rather than keeping them all visible
- Limit to 5-7 visible widgets for best performance

### For Clarity:
- Group related metrics together
- Put actionable insights near the top
- Keep consistent widget ordering across teams

### For Teams:
- Standardize on a template for each team
- Document why specific layouts are used
- Share template IDs for consistency

---

## 🔐 Access Control

Currently, the dashboard builder is accessible to all users. In future versions, you could:

- Restrict to Admin/Editor roles only
- Allow viewers to customize their personal view
- Save team-wide layouts (requires backend)
- Version control for layouts

---

## 📝 Future Enhancements

Planned features for the builder:

- **Resize Widgets:** Adjust widget height/width
- **Grid Snapping:** Precise alignment
- **Multi-column Layout:** Side-by-side widgets
- **Custom Widgets:** Build your own
- **Layout Sharing:** Export/import layouts
- **Team Templates:** Share across organization

---

## ✅ Summary

The Dashboard Builder provides:
- ✅ Drag-and-drop reordering
- ✅ Show/hide widgets
- ✅ Add/remove widgets
- ✅ Template library (4 templates)
- ✅ Auto-save to LocalStorage
- ✅ Reset to default option
- ✅ Mobile responsive
- ✅ Smooth animations

**Access it now:** Click "🎨 Customize" in the dashboard header!

---

**Last Updated:** November 3, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅

