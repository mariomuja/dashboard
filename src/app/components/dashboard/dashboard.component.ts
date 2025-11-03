import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { DataService, KpiData, ChartDataPoint } from '../../services/data.service';
import { ExportService } from '../../services/export.service';
import { DateRange } from '../date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  kpiData: KpiData[] = [];
  revenueData: ChartDataPoint[] = [];
  salesData: ChartDataPoint[] = [];
  conversionData: ChartDataPoint[] = [];
  selectedPeriod: 'week' | 'month' | 'year' = 'month';
  isLoading = true;
  showExportMenu = false;
  customDateRange: DateRange | null = null;

  constructor(
    private dataService: DataService,
    private exportService: ExportService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    let loadedCount = 0;
    const totalLoads = 4;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalLoads) {
        setTimeout(() => {
          this.isLoading = false;
        }, 300); // Small delay for smooth transition
      }
    };
    this.dataService.getKpiData(this.selectedPeriod).subscribe(data => {
      this.kpiData = data;
      checkComplete();
    });

    this.dataService.getRevenueData(this.selectedPeriod).subscribe(data => {
      this.revenueData = data;
      checkComplete();
    });

    this.dataService.getSalesData(this.selectedPeriod).subscribe(data => {
      this.salesData = data;
      checkComplete();
    });

    this.dataService.getConversionData(this.selectedPeriod).subscribe(data => {
      this.conversionData = data;
      checkComplete();
    });
  }

  onPeriodChange(period: 'week' | 'month' | 'year'): void {
    this.selectedPeriod = period;
    this.loadData(); // Reload data with new period
  }

  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  exportToCSV(): void {
    const exportData = this.kpiData.map(kpi => ({
      Title: kpi.title,
      Value: kpi.value,
      Change: `${kpi.change}%`,
      Trend: kpi.trend
    }));
    this.exportService.exportToCSV(exportData, `dashboard-kpi-${this.selectedPeriod}`);
    this.showExportMenu = false;
  }

  exportToExcel(): void {
    const exportData = this.kpiData.map(kpi => ({
      Title: kpi.title,
      Value: kpi.value,
      Change: `${kpi.change}%`,
      Trend: kpi.trend
    }));
    this.exportService.exportToExcel(exportData, `dashboard-kpi-${this.selectedPeriod}`);
    this.showExportMenu = false;
  }

  exportToPDF(): void {
    const periodLabel = this.customDateRange 
      ? this.customDateRange.label 
      : this.selectedPeriod.charAt(0).toUpperCase() + this.selectedPeriod.slice(1);
      
    this.exportService.exportDashboardToPDF({
      kpis: this.kpiData,
      period: periodLabel,
      date: new Date().toLocaleDateString()
    });
    this.showExportMenu = false;
  }

  onDateRangeSelected(dateRange: DateRange): void {
    this.customDateRange = dateRange;
    console.log('Custom date range selected:', dateRange);
    // In a real app, you would filter data by date range here
    // For now, we'll just reload the current period data
    this.loadData();
  }
}



