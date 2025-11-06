import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ExternalKPI {
  id: string;
  source_app: string;
  source_app_display: string;
  kpi_name: string;
  kpi_value: number;
  kpi_unit: string;
  kpi_change: number;
  kpi_icon: string;
  kpi_color: string;
  chart_type: string | null;
  chart_data: any;
  description: string;
  category: string;
}

interface KPIsBySource {
  sourceApp: string;
  sourceAppDisplay: string;
  kpis: ExternalKPI[];
}

@Component({
  selector: 'app-external-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="external-kpis-container">
      <div *ngIf="kpisBySource.length === 0" class="no-kpis">
        <p>No external KPIs received yet</p>
        <p class="hint">KPIs from connected apps will appear here</p>
      </div>

      <div *ngFor="let source of kpisBySource" class="source-section">
        <div class="source-header">
          <h3>{{ source.sourceAppDisplay }}</h3>
          <span class="source-badge">{{ source.kpis.length }} KPIs</span>
        </div>

        <div class="kpis-grid">
          <div *ngFor="let kpi of source.kpis" 
               class="kpi-card"
               [class.has-chart]="kpi.chart_type">
            
            <!-- KPI Value Card -->
            <div *ngIf="!kpi.chart_type" class="kpi-value-card">
              <div class="kpi-header">
                <span class="kpi-icon">{{ kpi.kpi_icon }}</span>
                <span class="kpi-name">{{ kpi.kpi_name }}</span>
              </div>
              <div class="kpi-value">
                {{ formatValue(kpi.kpi_value, kpi.kpi_unit) }}
              </div>
              <div class="kpi-footer">
                <span class="kpi-change" 
                      [class.positive]="kpi.kpi_change > 0"
                      [class.negative]="kpi.kpi_change < 0"
                      [class.neutral]="kpi.kpi_change === 0">
                  {{ kpi.kpi_change > 0 ? '+' : '' }}{{ kpi.kpi_change }}%
                </span>
                <span class="kpi-source">from {{ source.sourceAppDisplay }}</span>
              </div>
            </div>

            <!-- Chart Card -->
            <div *ngIf="kpi.chart_type" class="kpi-chart-card">
              <div class="chart-header">
                <span class="chart-title">{{ kpi.kpi_name }}</span>
                <span class="chart-source">📊 {{ source.sourceAppDisplay }}</span>
              </div>
              <div class="chart-placeholder">
                <p>{{ kpi.description }}</p>
                <small>Chart data ready for visualization</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .external-kpis-container {
      padding: 1.5rem;
    }

    .no-kpis {
      text-align: center;
      padding: 3rem;
      color: #9ca3af;
    }

    .hint {
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .source-section {
      margin-bottom: 2rem;
    }

    .source-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .source-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1f2937;
    }

    .source-badge {
      padding: 0.25rem 0.75rem;
      background: #3b82f6;
      color: white;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .kpi-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.5rem;
      transition: all 0.2s;
    }

    .kpi-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .kpi-value-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .kpi-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .kpi-icon {
      font-size: 1.5rem;
    }

    .kpi-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .kpi-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.75rem;
    }

    .kpi-change {
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .kpi-change.positive {
      background: #d1fae5;
      color: #065f46;
    }

    .kpi-change.negative {
      background: #fee2e2;
      color: #991b1b;
    }

    .kpi-change.neutral {
      background: #f3f4f6;
      color: #6b7280;
    }

    .kpi-source {
      color: #9ca3af;
      font-style: italic;
    }

    .kpi-chart-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .chart-header {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .chart-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .chart-source {
      font-size: 0.75rem;
      color: #3b82f6;
      font-weight: 500;
    }

    .chart-placeholder {
      background: #f9fafb;
      border: 1px dashed #d1d5db;
      border-radius: 0.375rem;
      padding: 1.5rem;
      text-align: center;
      color: #6b7280;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .chart-placeholder small {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.5rem;
    }
  `]
})
export class ExternalKpisComponent implements OnInit {
  kpisBySource: KPIsBySource[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadExternalKPIs();
  }

  loadExternalKPIs(): void {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      this.loading = false;
      return;
    }

    const apiUrl = environment.apiUrl || 'http://localhost:3001/api';
    
    this.http.get<KPIsBySource[]>(`${apiUrl}/kpis/external/by-source`, {
      headers: { 'X-Session-Id': sessionId }
    }).subscribe({
      next: (data) => {
        this.kpisBySource = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading external KPIs:', err);
        this.error = 'Failed to load external KPIs';
        this.loading = false;
      }
    });
  }

  formatValue(value: number, unit: string): string {
    if (unit === '$') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (unit === '%') {
      return `${value}%`;
    } else if (unit === 'count') {
      return value.toLocaleString('en-US');
    }
    return `${value} ${unit}`;
  }
}

