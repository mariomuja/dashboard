import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ChartDataPoint } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-conversion-chart',
  templateUrl: './conversion-chart.component.html',
  styleUrls: ['./conversion-chart.component.css']
})
export class ConversionChartComponent implements OnInit, OnChanges {
  @Input() data: ChartDataPoint[] = [];
  @Input() period: 'week' | 'month' | 'year' = 'month';
  @Input() chartConfigId?: string;
  @Output() edit = new EventEmitter<string>();

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Conversion Rate Trend',
        font: {
          size: 18,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  public lineChartLegend = true;

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
    this.lineChartData = {
      labels: this.data.map(d => d.label),
      datasets: [
        {
          data: this.data.map(d => d.value),
          label: 'Conversion Rate',
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  }
}

