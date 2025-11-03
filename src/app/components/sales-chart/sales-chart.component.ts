import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ChartDataPoint } from '../../services/data.service';

@Component({
  selector: 'app-sales-chart',
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.css']
})
export class SalesChartComponent implements OnInit, OnChanges {
  @Input() data: ChartDataPoint[] = [];
  @Input() period: 'week' | 'month' | 'year' = 'month';

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

  ngOnInit(): void {
    this.updateChart();
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

