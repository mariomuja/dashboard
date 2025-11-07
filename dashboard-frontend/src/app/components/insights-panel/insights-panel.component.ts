import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { AiInsightsService, Insight } from '../../services/ai-insights.service';
import { KpiData } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
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
  @Input() insightsConfigId?: string;
  @Output() edit = new EventEmitter<string>();
  insights: Insight[] = [];
  showPanel = true;

  constructor(
    private aiInsightsService: AiInsightsService,
    public authService: AuthService
  ) {}

  get showEditButton(): boolean {
    return this.authService.isAuthenticated() && !!this.insightsConfigId;
  }

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

  onEdit(event: Event): void {
    event.stopPropagation();
    if (this.insightsConfigId) {
      this.edit.emit(this.insightsConfigId);
    }
  }
}

