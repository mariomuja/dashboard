import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { InsightsConfigService, InsightsConfig } from '../../services/insights-config.service';

@Component({
  selector: 'app-insights-editor',
  templateUrl: './insights-editor.component.html',
  styleUrls: ['./insights-editor.component.css']
})
export class InsightsEditorComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  config: Partial<InsightsConfig> = {};

  constructor(private insightsConfigService: InsightsConfigService) {}

  ngOnInit(): void {
    const existing = this.insightsConfigService.getConfig();
    if (existing) {
      this.config = { ...existing };
    } else {
      // Default values
      this.config = {
        enabled: true,
        kpisToAnalyze: ['all'],
        thresholds: {
          significantChange: 5,
          warningThreshold: 10,
          criticalThreshold: 20
        },
        insightTypes: {
          trendAnalysis: true,
          anomalyDetection: true,
          recommendations: true,
          predictions: false
        },
        customMessages: {}
      };
    }
  }

  save(): void {
    this.insightsConfigService.updateConfig(this.config);
    this.saved.emit();
    this.close.emit();
  }

  cancel(): void {
    this.close.emit();
  }
}
