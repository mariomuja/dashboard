import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate } from '@angular/animations';
import { CdkDragDrop, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { DashboardLayoutService, WidgetConfig } from '../../services/dashboard-layout.service';
import { DashboardTemplatesService, DashboardTemplate } from '../../services/dashboard-templates.service';
import { DashboardVersionControlService } from '../../services/dashboard-version-control.service';
import { Router } from '@angular/router';

interface ResizeHandle {
  widgetId: string;
  direction: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

@Component({
  selector: 'app-dashboard-builder',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './dashboard-builder.component.html',
  styleUrls: ['./dashboard-builder.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, height: 0 }))
      ])
    ])
  ]
})
export class DashboardBuilderComponent implements OnInit {
  widgets: WidgetConfig[] = [];
  editMode = true;
  showTemplateSelector = false;
  showWidgetPicker = false;
  showGridOverlay = true;
  templates: DashboardTemplate[] = [];
  
  // Grid system constants
  readonly GRID_COLUMNS = 12;
  readonly GRID_ROWS = 100;
  readonly CELL_HEIGHT = 80; // pixels
  
  // Resize state
  private resizing: ResizeHandle | null = null;
  draggingWidget: string | null = null;

  availableWidgets = [
    { type: 'kpi', label: 'KPI Cards', icon: '📊' },
    { type: 'chart-revenue', label: 'Revenue Chart', icon: '💰' },
    { type: 'chart-sales', label: 'Sales Chart', icon: '📈' },
    { type: 'chart-conversion', label: 'Conversion Chart', icon: '📉' },
    { type: 'pie', label: 'Pie Chart', icon: '🥧' },
    { type: 'goals', label: 'Goal Tracker', icon: '🎯' },
    { type: 'insights', label: 'AI Insights', icon: '🤖' }
  ];

  constructor(
    private layoutService: DashboardLayoutService,
    private templatesService: DashboardTemplatesService,
    private versionControl: DashboardVersionControlService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const layout = this.layoutService.getCurrentLayout();
    this.widgets = [...layout.widgets];
    this.templates = this.templatesService.getTemplates();
    
    // Ensure all widgets have proper grid positions and are within bounds
    this.widgets.forEach((widget, index) => {
      if (!widget.position) {
        widget.position = { row: Math.floor(index / 2) * 2, col: (index % 2) * 6 };
      }
      if (!widget.size) {
        widget.size = { width: 6, height: 2 };
      }
      
      // Constrain widgets to grid bounds
      widget.position.row = Math.max(0, Math.min(widget.position.row, this.GRID_ROWS - widget.size.height));
      widget.position.col = Math.max(0, Math.min(widget.position.col, this.GRID_COLUMNS - widget.size.width));
      
      // Ensure size is reasonable
      widget.size.width = Math.max(2, Math.min(widget.size.width, this.GRID_COLUMNS));
      widget.size.height = Math.max(1, Math.min(widget.size.height, this.GRID_ROWS));
    });
    
    // Save the corrected layout
    this.saveLayout();
  }

  onDragEnded(event: CdkDragEnd, widget: WidgetConfig): void {
    // Get the final position
    const element = event.source.element.nativeElement;
    const container = document.querySelector('.grid-container') as HTMLElement;
    
    if (!container) {
      event.source.reset();
      return;
    }
    
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    // Calculate position relative to container
    const relativeX = elementRect.left - containerRect.left;
    const relativeY = elementRect.top - containerRect.top;
    
    // Calculate cell dimensions
    const cellWidth = containerRect.width / this.GRID_COLUMNS;
    
    // Snap to nearest grid cell
    const newCol = Math.max(0, Math.min(
      this.GRID_COLUMNS - widget.size.width,
      Math.round(relativeX / cellWidth)
    ));
    const newRow = Math.max(0, Math.min(
      this.GRID_ROWS - widget.size.height,
      Math.round(relativeY / this.CELL_HEIGHT)
    ));
    
    // Update widget position
    widget.position = { row: newRow, col: newCol };
    
    this.draggingWidget = null;
    this.saveLayout();
    
    // Reset transform to allow CSS Grid to position the element
    event.source.reset();
  }

  onDragStarted(widget: WidgetConfig): void {
    this.draggingWidget = widget.id;
  }

  toggleWidget(widgetId: string): void {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.visible = !widget.visible;
      this.saveLayout();
    }
  }

  addWidget(type: string): void {
    // Find the first available spot in the grid
    let row = 0;
    let col = 0;
    const width = 6;
    const height = 2;
    
    // Simple placement algorithm - find first available spot
    outerLoop: for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c <= this.GRID_COLUMNS - width; c++) {
        if (this.isSpaceAvailable(r, c, width, height)) {
          row = r;
          col = c;
          break outerLoop;
        }
      }
    }
    
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      position: { row, col },
      size: { width, height },
      visible: true
    };
    this.widgets.push(newWidget);
    this.saveLayout();
    this.showWidgetPicker = false;
  }

  removeWidget(widgetId: string): void {
    if (confirm('Are you sure you want to remove this widget?')) {
      this.widgets = this.widgets.filter(w => w.id !== widgetId);
      this.saveLayout();
    }
  }

  // Resize handle methods
  onResizeStart(event: MouseEvent, widget: WidgetConfig, direction: ResizeHandle['direction']): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.resizing = {
      widgetId: widget.id,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: widget.size.width,
      startHeight: widget.size.height
    };
    
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResizeMove = (event: MouseEvent): void => {
    if (!this.resizing) return;
    
    const widget = this.widgets.find(w => w.id === this.resizing!.widgetId);
    if (!widget) return;
    
    const container = document.querySelector('.grid-container') as HTMLElement;
    if (!container) return;
    
    const cellWidth = container.offsetWidth / this.GRID_COLUMNS;
    const deltaX = event.clientX - this.resizing.startX;
    const deltaY = event.clientY - this.resizing.startY;
    
    const deltaColumns = Math.round(deltaX / cellWidth);
    const deltaRows = Math.round(deltaY / this.CELL_HEIGHT);
    
    const direction = this.resizing.direction;
    
    // Handle horizontal resizing
    if (direction.includes('e')) {
      const newWidth = Math.max(2, Math.min(this.GRID_COLUMNS - widget.position.col, this.resizing.startWidth + deltaColumns));
      widget.size.width = newWidth;
    } else if (direction.includes('w')) {
      const newWidth = Math.max(2, this.resizing.startWidth - deltaColumns);
      const widthDiff = this.resizing.startWidth - newWidth;
      if (widget.position.col + widthDiff >= 0) {
        widget.size.width = newWidth;
        widget.position.col += widthDiff;
      }
    }
    
    // Handle vertical resizing
    if (direction.includes('s')) {
      const newHeight = Math.max(1, Math.min(this.GRID_ROWS - widget.position.row, this.resizing.startHeight + deltaRows));
      widget.size.height = newHeight;
    } else if (direction.includes('n')) {
      const newHeight = Math.max(1, this.resizing.startHeight - deltaRows);
      const heightDiff = this.resizing.startHeight - newHeight;
      if (widget.position.row + heightDiff >= 0) {
        widget.size.height = newHeight;
        widget.position.row += heightDiff;
      }
    }
  };

  private onResizeEnd = (): void => {
    if (this.resizing) {
      this.resizing = null;
      this.saveLayout();
    }
    
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
  };

  private isSpaceAvailable(row: number, col: number, width: number, height: number, excludeId?: string): boolean {
    for (const widget of this.widgets) {
      if (excludeId && widget.id === excludeId) continue;
      if (!widget.visible) continue;
      
      const widgetRight = widget.position.col + widget.size.width;
      const widgetBottom = widget.position.row + widget.size.height;
      const checkRight = col + width;
      const checkBottom = row + height;
      
      const horizontalOverlap = col < widgetRight && checkRight > widget.position.col;
      const verticalOverlap = row < widgetBottom && checkBottom > widget.position.row;
      
      if (horizontalOverlap && verticalOverlap) {
        return false;
      }
    }
    return true;
  }

  toggleGridOverlay(): void {
    this.showGridOverlay = !this.showGridOverlay;
  }

  getWidgetStyle(widget: WidgetConfig): any {
    const cellWidth = 100 / this.GRID_COLUMNS; // percentage
    return {
      'grid-column': `${widget.position.col + 1} / span ${widget.size.width}`,
      'grid-row': `${widget.position.row + 1} / span ${widget.size.height}`,
      'min-height': `${widget.size.height * this.CELL_HEIGHT}px`
    };
  }

  applyTemplate(templateId: string): void {
    const template = this.templatesService.getTemplateById(templateId);
    if (template) {
      this.widgets = [...template.layout.widgets];
      this.layoutService.updateLayout(template.layout);
      this.showTemplateSelector = false;
      alert(`Applied template: ${template.name}`);
    }
  }

  resetToDefault(): void {
    if (confirm('Reset to default layout? This will discard your custom layout.')) {
      this.layoutService.resetToDefault();
      const layout = this.layoutService.getCurrentLayout();
      this.widgets = [...layout.widgets];
    }
  }

  saveLayout(): void {
    const layout = {
      name: 'Custom',
      widgets: this.widgets
    };
    this.layoutService.updateLayout(layout);
    
    // Save version
    this.versionControl.saveVersion(
      'dashboard-main',
      layout,
      'User Changes',
      'Manual save from dashboard builder',
      ['manual-save']
    );
    
    console.log('Layout saved with version control');
  }
  
  saveVersionWithName(): void {
    const name = prompt('Enter version name:');
    const description = prompt('Enter version description (optional):');
    
    if (name) {
      const layout = {
        name: 'Custom',
        widgets: this.widgets
      };
      
      const version = this.versionControl.saveVersion(
        'dashboard-main',
        layout,
        name,
        description || `Version saved on ${new Date().toLocaleDateString()}`,
        ['manual-save', 'named-version']
      );
      
      alert(`Saved as version ${version.version}: ${name}`);
    }
  }
  
  viewVersionHistory(): void {
    const history = this.versionControl.getHistory('dashboard-main');
    console.log('Version History:', history);
    alert(`Total versions: ${history.versions.length}\nActive: v${history.activeVersion?.version || 'None'}`);
  }

  getWidgetLabel(type: string): string {
    const widget = this.availableWidgets.find(w => w.type === type);
    return widget ? widget.label : type;
  }

  getWidgetIcon(type: string): string {
    const widget = this.availableWidgets.find(w => w.type === type);
    return widget ? widget.icon : '📦';
  }

  toggleTemplateSelector(): void {
    this.showTemplateSelector = !this.showTemplateSelector;
  }

  toggleWidgetPicker(): void {
    this.showWidgetPicker = !this.showWidgetPicker;
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }
}


