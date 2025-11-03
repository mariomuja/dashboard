import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface WidgetConfig {
  id: string;
  type: 'kpi' | 'chart-revenue' | 'chart-sales' | 'chart-conversion' | 'pie' | 'goals' | 'insights';
  position: { row: number; col: number };
  size: { width: number; height: number };
  visible: boolean;
}

export interface DashboardLayout {
  name: string;
  widgets: WidgetConfig[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardLayoutService {
  private readonly LAYOUT_KEY = 'dashboard_layout';
  private readonly DEFAULT_LAYOUT: DashboardLayout = {
    name: 'Default',
    widgets: [
      { id: 'kpi-1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 12, height: 2 }, visible: true },
      { id: 'chart-revenue-1', type: 'chart-revenue', position: { row: 2, col: 0 }, size: { width: 6, height: 3 }, visible: true },
      { id: 'chart-sales-1', type: 'chart-sales', position: { row: 2, col: 6 }, size: { width: 6, height: 3 }, visible: true },
      { id: 'chart-conversion-1', type: 'chart-conversion', position: { row: 5, col: 0 }, size: { width: 12, height: 3 }, visible: true },
      { id: 'pie-1', type: 'pie', position: { row: 8, col: 0 }, size: { width: 6, height: 3 }, visible: true },
      { id: 'goals-1', type: 'goals', position: { row: 8, col: 6 }, size: { width: 6, height: 3 }, visible: true },
      { id: 'insights-1', type: 'insights', position: { row: 11, col: 0 }, size: { width: 12, height: 3 }, visible: true }
    ]
  };

  private currentLayoutSubject: BehaviorSubject<DashboardLayout>;
  public currentLayout$: Observable<DashboardLayout>;

  constructor() {
    const saved = this.loadLayout();
    this.currentLayoutSubject = new BehaviorSubject<DashboardLayout>(saved || this.DEFAULT_LAYOUT);
    this.currentLayout$ = this.currentLayoutSubject.asObservable();
  }

  getCurrentLayout(): DashboardLayout {
    return this.currentLayoutSubject.value;
  }

  updateLayout(layout: DashboardLayout): void {
    this.saveLayout(layout);
    this.currentLayoutSubject.next(layout);
  }

  resetToDefault(): void {
    this.updateLayout(this.DEFAULT_LAYOUT);
  }

  toggleWidgetVisibility(widgetId: string): void {
    const layout = this.getCurrentLayout();
    const widget = layout.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.visible = !widget.visible;
      this.updateLayout(layout);
    }
  }

  private saveLayout(layout: DashboardLayout): void {
    localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(layout));
  }

  private loadLayout(): DashboardLayout | null {
    const saved = localStorage.getItem(this.LAYOUT_KEY);
    return saved ? JSON.parse(saved) : null;
  }
}

