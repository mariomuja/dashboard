import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { DataService, KpiData, ChartDataPoint } from '../../services/data.service';
import { ExportService } from '../../services/export.service';
import { OrganizationService } from '../../services/organization.service';
import { DashboardLayoutService, WidgetConfig } from '../../services/dashboard-layout.service';
import { KpiConfigService, KPIConfig } from '../../services/kpi-config.service';
import { ChartConfigService, ChartConfig } from '../../services/chart-config.service';
import { GoalConfigService } from '../../services/goal-config.service';
import { InsightsConfigService } from '../../services/insights-config.service';
import { Goal } from '../goal-tracker/goal-tracker.component';
import { AuthService } from '../../services/auth.service';
import { DateRange } from '../date-range-picker/date-range-picker.component';
import { Subscription } from 'rxjs';
import { OrganizationSelectorComponent } from '../organization-selector/organization-selector.component';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';
import { KpiCardComponent } from '../kpi-card/kpi-card.component';
import { RevenueChartComponent } from '../revenue-chart/revenue-chart.component';
import { SalesChartComponent } from '../sales-chart/sales-chart.component';
import { ConversionChartComponent } from '../conversion-chart/conversion-chart.component';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { GoalTrackerComponent } from '../goal-tracker/goal-tracker.component';
import { InsightsPanelComponent } from '../insights-panel/insights-panel.component';
import { ExternalKpisComponent } from '../external-kpis/external-kpis.component';
import { CommentsPanelComponent } from '../comments-panel/comments-panel.component';
import { KpiEditorComponent } from '../kpi-editor/kpi-editor.component';
import { ChartEditorComponent } from '../chart-editor/chart-editor.component';
import { GoalEditorComponent } from '../goal-editor/goal-editor.component';
import { InsightsEditorComponent } from '../insights-editor/insights-editor.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OrganizationSelectorComponent,
    DateRangePickerComponent,
    LoadingSkeletonComponent,
    KpiCardComponent,
    RevenueChartComponent,
    SalesChartComponent,
    ConversionChartComponent,
    PieChartComponent,
    GoalTrackerComponent,
    InsightsPanelComponent,
    ExternalKpisComponent,
    CommentsPanelComponent,
    KpiEditorComponent,
    ChartEditorComponent,
    GoalEditorComponent,
    InsightsEditorComponent
  ],
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
  chartConfigs: ChartConfig[] = [];
  chartConfigMap: Map<string, string> = new Map(); // Maps chart names to config IDs
  goals: Goal[] = [];
  revenueData: ChartDataPoint[] = [];
  salesData: ChartDataPoint[] = [];
  conversionData: ChartDataPoint[] = [];
  selectedPeriod: 'week' | 'month' | 'year' = 'month';
  isLoading = true;
  showExportMenu = false;
  showKpiEditor = false;
  showChartEditor = false;
  showGoalEditor = false;
  showInsightsEditor = false;
  editingKpiId?: string;
  editingChartId?: string;
  customDateRange: DateRange | null = null;
  widgets: WidgetConfig[] = [];
  private orgSubscription?: Subscription;
  private layoutSubscription?: Subscription;
  private kpiConfigSubscription?: Subscription;
  private chartConfigSubscription?: Subscription;
  private goalConfigSubscription?: Subscription;

  constructor(
    private dataService: DataService,
    private exportService: ExportService,
    private orgService: OrganizationService,
    private layoutService: DashboardLayoutService,
    private kpiConfigService: KpiConfigService,
    private chartConfigService: ChartConfigService,
    private goalConfigService: GoalConfigService,
    private insightsConfigService: InsightsConfigService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    // Initialize default KPIs, Charts, Goals, and Insights if none exist
    this.kpiConfigService.initializeDefaultKpis();
    this.chartConfigService.initializeDefaultCharts();
    this.goalConfigService.initializeDefaultGoals();
    this.insightsConfigService.initializeDefault();
    
    this.loadData();
    this.loadKpiConfigs();
    this.loadChartConfigs();
    this.loadGoals();
    
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
    
    // Subscribe to Chart config changes
    this.chartConfigSubscription = this.chartConfigService.configs$.subscribe(() => {
      this.loadChartConfigs();
    });
    
    // Subscribe to Goal config changes
    this.goalConfigSubscription = this.goalConfigService.config$.subscribe(() => {
      this.loadGoals();
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
    if (this.chartConfigSubscription) {
      this.chartConfigSubscription.unsubscribe();
    }
    if (this.goalConfigSubscription) {
      this.goalConfigSubscription.unsubscribe();
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
    const totalLoads = 3; // Only load chart data, not KPIs (loaded separately from configs)

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalLoads) {
        setTimeout(() => {
          this.isLoading = false;
        }, 300); // Small delay for smooth transition
      }
    };
    
    // Don't load KPIs from old service - they come from kpiConfigService now
    // this.dataService.getKpiData(this.selectedPeriod).subscribe(data => {
    //   this.kpiData = data;
    //   checkComplete();
    // });

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
      
      // Store mapping using KPI data ID (which is the config ID)
      this.kpiConfigMap.set(kpiData.id, config.id);
      
      return kpiData;
    });
    
    const configuredKpis = await Promise.all(kpiDataPromises);
    
    // Replace KPI data with configured KPIs
    this.kpiData = configuredKpis;
    console.log('Loaded KPI configs:', this.kpiData.length, 'Config map:', this.kpiConfigMap);
  }

  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getKpiConfigId(kpi: KpiData): string | undefined {
    // The kpi.id is the config ID now
    return kpi.id;
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

  // Chart Configuration Methods
  async loadChartConfigs(): Promise<void> {
    this.chartConfigs = this.chartConfigService.getVisibleConfigs();
    this.chartConfigMap.clear();
    
    // Map chart configs to IDs
    this.chartConfigs.forEach(config => {
      this.chartConfigMap.set(config.name, config.id);
      console.log('Mapped chart:', config.name, '→', config.id);
    });
    
    console.log('Chart config map:', this.chartConfigMap);
  }

  getChartConfigId(chartName: string): string | undefined {
    const id = this.chartConfigMap.get(chartName);
    console.log('Getting chart ID for:', chartName, '→', id);
    return id;
  }

  openChartEditor(chartId?: string): void {
    this.editingChartId = chartId;
    this.showChartEditor = true;
  }

  onChartEdit(chartConfigId: string): void {
    this.openChartEditor(chartConfigId);
  }

  createNewChart(): void {
    this.openChartEditor();
  }

  closeChartEditor(): void {
    this.showChartEditor = false;
    this.editingChartId = undefined;
  }

  onChartSaved(): void {
    this.loadChartConfigs();
    this.loadData(); // Reload chart data
  }

  // Goal Configuration Methods
  loadGoals(): void {
    this.goals = this.goalConfigService.getGoals();
  }

  openGoalEditor(): void {
    this.showGoalEditor = true;
  }

  onGoalEdit(configId: string): void {
    this.openGoalEditor();
  }

  closeGoalEditor(): void {
    this.showGoalEditor = false;
  }

  onGoalSaved(): void {
    this.loadGoals();
  }

  // AI Insights Configuration Methods
  openInsightsEditor(): void {
    this.showInsightsEditor = true;
  }

  onInsightsEdit(configId: string): void {
    this.openInsightsEditor();
  }

  closeInsightsEditor(): void {
    this.showInsightsEditor = false;
  }

  onInsightsSaved(): void {
    // Insights will regenerate automatically on next KPI data change
    console.log('Insights configuration saved');
  }
}



