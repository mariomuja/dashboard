import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {
  @Input() title: string = 'Revenue by Category';
  @Input() chartConfigId?: string;
  @Output() edit = new EventEmitter<string>();
  
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: []
  };

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      title: {
        display: true,
        text: this.title,
        font: {
          size: 18,
          weight: 'bold'
        }
      }
    }
  };

  constructor(public authService: AuthService) {}

  get showEditButton(): boolean {
    return this.authService.isAuthenticated() && !!this.chartConfigId;
  }

  ngOnInit(): void {
    // Sample data - in real app, this would come from service
    this.pieChartData = {
      labels: ['Products', 'Services', 'Subscriptions', 'Other'],
      datasets: [{
        data: [45, 30, 20, 5],
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#8b5cf6',
          '#f59e0b'
        ],
        hoverOffset: 10
      }]
    };
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    if (this.chartConfigId) {
      this.edit.emit(this.chartConfigId);
    }
  }
}

