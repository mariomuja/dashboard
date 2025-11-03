import { Component, OnInit } from '@angular/core';
import { DataService, KpiData, ChartDataPoint } from '../../services/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  kpiData: KpiData[] = [];
  revenueData: ChartDataPoint[] = [];
  salesData: ChartDataPoint[] = [];
  conversionData: ChartDataPoint[] = [];
  selectedPeriod: 'week' | 'month' | 'year' = 'month';

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dataService.getKpiData().subscribe(data => {
      this.kpiData = data;
    });

    this.dataService.getRevenueData().subscribe(data => {
      this.revenueData = data;
    });

    this.dataService.getSalesData().subscribe(data => {
      this.salesData = data;
    });

    this.dataService.getConversionData().subscribe(data => {
      this.conversionData = data;
    });
  }

  onPeriodChange(period: 'week' | 'month' | 'year'): void {
    this.selectedPeriod = period;
    // In a real app, you would reload data based on the selected period
  }
}



