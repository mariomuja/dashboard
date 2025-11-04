import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { DataService, KpiData, ChartDataPoint } from '../../services/data.service';
import { ExportService } from '../../services/export.service';
import { OrganizationService } from '../../services/organization.service';
import { DashboardLayoutService, WidgetConfig } from '../../services/dashboard-layout.service';
import { KpiConfigService, KPIConfig } from '../../services/kpi-config.service';
import { DateRange } from '../date-range-picker/date-range-picker.component';
import { Subscription } from 'rxjs';

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
export class DashboardComponent implements OnInit, OnDestroy {
  kpiData: KpiData[] = [];
  kpiConfigs: KPIConfig[] = [];
  kpiConfigMap: Map<string, string> = new Map(); // Maps kpiData to kpiConfig IDs
  revenueData: ChartDataPoint[] = [];
  salesData: ChartDataPoint[] = [];
  conversionData: ChartDataPoint[] = [];
  selectedPeriod: 'week' | 'month' | 'year' = 'month';
  isLoading = true;
  showExportMenu = false;
  showKpiEditor = false;
  editingKpiId?: string;
  customDateRange: DateRange | null = null;
  widgets: WidgetConfig[] = [];
  private orgSubscription?: Subscription;
  private layoutSubscription?: Subscription;
  private kpiConfigSubscription?: Subscription;

  constructor(
    private dataService: DataService,
    private exportService: ExportService,
    private orgService: OrganizationService,
    private layoutService: DashboardLayoutService,
    private kpiConfigService: KpiConfigService
  ) { }

  ngOnInit(): void {
    // Initialize default KPIs if none exist
    this.kpiConfigService.initializeDefaultKpis();
    
    this.loadData();
    this.loadKpiConfigs();
    
    // Subscribe to layout changes
    this.layoutSubscription = this.layoutService.currentLayout$.subscribe(layout => {
      this.widgets = layout.widgets.filter(w => w.visible);
      console.log('Layout updated:', this.widgets);
    });
    
    // Subscribe to organization changes
    this.orgSubscription = this.orgService.currentOrg$.subscribe(org => {
      if (org) {
        console.log('Organization changed to:', org.name);
        this.dataService.reloadData();
        this.loadData();
      }
    });
    
    // Subscribe to KPI config changes
    this.kpiConfigSubscription = this.kpiConfigService.configs$.subscribe(() => {
      this.loadKpiConfigs();
    });
  }

  ngOnDestroy(): void {
    if (this.orgSubscription) {
      this.orgSubscription.unsubscribe();
    }
    if (this.layoutSubscription) {
      this.layoutSubscription.unsubscribe();
    }
    if (this.kpiConfigSubscription) {
      this.kpiConfigSubscription.unsubscribe();
    }
  }
  
  isWidgetVisible(type: string): boolean {
    return this.widgets.some(w => w.type === type && w.visible);
  }
  
  getWidgetsByType(type: string): WidgetConfig[] {
    return this.widgets.filter(w => w.type === type);
  }
  
  getWidgetStyle(widget: WidgetConfig): any {
    return {
      'grid-column': `${widget.position.col + 1} / span ${widget.size.width}`,
      'grid-row': `${widget.position.row + 1} / span ${widget.size.height}`,
      'order': widget.position.row * 100 + widget.position.col
    };
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

  // KPI Configuration Methods
  async loadKpiConfigs(): Promise<void> {
    this.kpiConfigs = this.kpiConfigService.getVisibleConfigs();
    this.kpiConfigMap.clear();
    
    // Load KPI data from configured sources
    const kpiDataPromises = this.kpiConfigs.map(async (config) => {
      const result = await this.kpiConfigService.fetchKpiValue(config);
      const kpiData: KpiData = {
        id: config.id,
        title: config.name,
        value: this.kpiConfigService.formatValue(result.value, config.formatting),
        change: result.change || 0,
        trend: result.trend || 'stable',
        icon: config.icon || '📊',
        color: this.getTrendColor(result.trend || 'stable')
      };
      
      // Store mapping
      this.kpiConfigMap.set(kpiData.title, config.id);
      
      return kpiData;
    });
    
    const configuredKpis = await Promise.all(kpiDataPromises);
    
    // Merge with existing KPIs or replace them
    this.kpiData = configuredKpis;
  }

  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getKpiConfigId(kpi: KpiData): string | undefined {
    return this.kpiConfigMap.get(kpi.title);
  }

  openKpiEditor(kpiId?: string): void {
    this.editingKpiId = kpiId;
    this.showKpiEditor = true;
  }

  onKpiEdit(kpiConfigId: string): void {
    this.openKpiEditor(kpiConfigId);
  }

  createNewKpi(): void {
    this.openKpiEditor();
  }

  closeKpiEditor(): void {
    this.showKpiEditor = false;
    this.editingKpiId = undefined;
  }

  onKpiSaved(): void {
    this.loadKpiConfigs();
  }
}



