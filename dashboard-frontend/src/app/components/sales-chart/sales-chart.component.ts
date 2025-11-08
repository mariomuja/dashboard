import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ChartDataPoint } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  selector: 'app-sales-chart',
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.css']
})
export class SalesChartComponent implements OnInit, OnChanges {
  @Input() data: ChartDataPoint[] = [];
  @Input() period: 'week' | 'month' | 'year' = 'month';
  @Input() chartConfigId?: string;
  @Output() edit = new EventEmitter<string>();

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Sales Volume',
        font: {
          size: 18,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public barChartLegend = true;

  constructor(public authService: AuthService) {}

  get showEditButton(): boolean {
    return this.authService.isAuthenticated() && !!this.chartConfigId;
  }

  ngOnInit(): void {
    this.updateChart();
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    if (this.chartConfigId) {
      this.edit.emit(this.chartConfigId);
    }
  }

  ngOnChanges(): void {
    if (this.data.length > 0) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.barChartData = {
      labels: this.data.map(d => d.label),
      datasets: [
        {
          data: this.data.map(d => d.value),
          label: 'Sales',
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1
        }
      ]
    };
  }
}



