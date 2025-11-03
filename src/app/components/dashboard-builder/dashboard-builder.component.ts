import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DashboardLayoutService, WidgetConfig } from '../../services/dashboard-layout.service';
import { DashboardTemplatesService, DashboardTemplate } from '../../services/dashboard-templates.service';

@Component({
  selector: 'app-dashboard-builder',
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
  templates: DashboardTemplate[] = [];

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
    private templatesService: DashboardTemplatesService
  ) {}

  ngOnInit(): void {
    const layout = this.layoutService.getCurrentLayout();
    this.widgets = [...layout.widgets];
    this.templates = this.templatesService.getTemplates();
  }

  drop(event: CdkDragDrop<WidgetConfig[]>): void {
    moveItemInArray(this.widgets, event.previousIndex, event.currentIndex);
    this.saveLayout();
  }

  toggleWidget(widgetId: string): void {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.visible = !widget.visible;
      this.saveLayout();
    }
  }

  addWidget(type: string): void {
    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      position: { row: this.widgets.length, col: 0 },
      size: { width: 4, height: 1 },
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

