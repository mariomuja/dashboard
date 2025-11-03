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
    this.dataService.getKpiData(this.selectedPeriod).subscribe(data => {
      this.kpiData = data;
    });

    this.dataService.getRevenueData(this.selectedPeriod).subscribe(data => {
      this.revenueData = data;
    });

    this.dataService.getSalesData(this.selectedPeriod).subscribe(data => {
      this.salesData = data;
    });

    this.dataService.getConversionData(this.selectedPeriod).subscribe(data => {
      this.conversionData = data;
    });
  }

  onPeriodChange(period: 'week' | 'month' | 'year'): void {
    this.selectedPeriod = period;
    this.loadData(); // Reload data with new period
  }
}



