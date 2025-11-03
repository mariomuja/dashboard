import { Component, Input, OnChanges } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { AiInsightsService, Insight } from '../../services/ai-insights.service';
import { KpiData } from '../../services/data.service';

@Component({
  selector: 'app-insights-panel',
  templateUrl: './insights-panel.component.html',
  styleUrls: ['./insights-panel.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class InsightsPanelComponent implements OnChanges {
  @Input() kpiData: KpiData[] = [];
  insights: Insight[] = [];
  showPanel = true;

  constructor(private aiInsightsService: AiInsightsService) {}

  ngOnChanges(): void {
    if (this.kpiData && this.kpiData.length > 0) {
      this.insights = this.aiInsightsService.generateInsights(this.kpiData);
    }
  }

  getInsightIcon(type: string): string {
    switch (type) {
      case 'positive': return '✓';
      case 'negative': return '⚠';
      case 'warning': return '⚡';
      case 'info': return 'ℹ';
      default: return '•';
    }
  }

  togglePanel(): void {
    this.showPanel = !this.showPanel;
  }
}

