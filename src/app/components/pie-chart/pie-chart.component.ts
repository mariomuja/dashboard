import { Component, Input, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {
  @Input() title: string = 'Revenue by Category';
  
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
}

