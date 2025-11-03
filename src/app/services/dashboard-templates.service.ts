import { Injectable } from '@angular/core';
import { DashboardLayout } from './dashboard-layout.service';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'sales' | 'marketing' | 'executive';
  thumbnail: string;
  layout: DashboardLayout;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardTemplatesService {
  
  private templates: DashboardTemplate[] = [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview for executives',
      category: 'executive',
      thumbnail: '📊',
      layout: {
        name: 'Executive Summary',
        widgets: [
          { id: 'kpi-1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 4, height: 1 }, visible: true },
          { id: 'chart-revenue-1', type: 'chart-revenue', position: { row: 1, col: 0 }, size: { width: 4, height: 1 }, visible: true },
          { id: 'insights-1', type: 'insights', position: { row: 2, col: 0 }, size: { width: 4, height: 1 }, visible: true }
        ]
      }
    },
    {
      id: 'sales-dashboard',
      name: 'Sales Dashboard',
      description: 'Focus on sales metrics and trends',
      category: 'sales',
      thumbnail: '💰',
      layout: {
        name: 'Sales Dashboard',
        widgets: [
          { id: 'kpi-1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 4, height: 1 }, visible: true },
          { id: 'chart-sales-1', type: 'chart-sales', position: { row: 1, col: 0 }, size: { width: 2, height: 1 }, visible: true },
          { id: 'pie-1', type: 'pie', position: { row: 1, col: 2 }, size: { width: 2, height: 1 }, visible: true },
          { id: 'goals-1', type: 'goals', position: { row: 2, col: 0 }, size: { width: 4, height: 1 }, visible: true }
        ]
      }
    },
    {
      id: 'marketing-analytics',
      name: 'Marketing Analytics',
      description: 'Track marketing campaigns and ROI',
      category: 'marketing',
      thumbnail: '📈',
      layout: {
        name: 'Marketing Analytics',
        widgets: [
          { id: 'kpi-1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 4, height: 1 }, visible: true },
          { id: 'chart-conversion-1', type: 'chart-conversion', position: { row: 1, col: 0 }, size: { width: 4, height: 1 }, visible: true },
          { id: 'chart-revenue-1', type: 'chart-revenue', position: { row: 2, col: 0 }, size: { width: 2, height: 1 }, visible: true },
          { id: 'chart-sales-1', type: 'chart-sales', position: { row: 2, col: 2 }, size: { width: 2, height: 1 }, visible: true }
        ]
      }
    },
    {
      id: 'complete-overview',
      name: 'Complete Overview',
      description: 'All widgets and metrics',
      category: 'business',
      thumbnail: '🎯',
      layout: {
        name: 'Complete Overview',
        widgets: [
          { id: 'kpi-1', type: 'kpi', position: { row: 0, col: 0 }, size: { width: 4, height: 1 }, visible: true },
          { id: 'chart-revenue-1', type: 'chart-revenue', position: { row: 1, col: 0 }, size: { width: 2, height: 1 }, visible: true },
          { id: 'chart-sales-1', type: 'chart-sales', position: { row: 1, col: 2 }, size: { width: 2, height: 1 }, visible: true },
          { id: 'chart-conversion-1', type: 'chart-conversion', position: { row: 2, col: 0 }, size: { width: 4, height: 1 }, visible: true },
          { id: 'pie-1', type: 'pie', position: { row: 3, col: 0 }, size: { width: 2, height: 1 }, visible: true },
          { id: 'goals-1', type: 'goals', position: { row: 4, col: 0 }, size: { width: 4, height: 1 }, visible: true },
          { id: 'insights-1', type: 'insights', position: { row: 5, col: 0 }, size: { width: 4, height: 1 }, visible: true }
        ]
      }
    }
  ];

  getTemplates(): DashboardTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): DashboardTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getTemplatesByCategory(category: string): DashboardTemplate[] {
    return this.templates.filter(t => t.category === category);
  }
}

