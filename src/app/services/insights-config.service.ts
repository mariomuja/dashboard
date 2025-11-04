import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface InsightsConfig {
  id: string;
  enabled: boolean;
  kpisToAnalyze: string[]; // Which KPIs to generate insights for
  thresholds: {
    significantChange: number; // % change to trigger insight
    warningThreshold: number; // % for warning insights
    criticalThreshold: number; // % for critical insights
  };
  insightTypes: {
    trendAnalysis: boolean;
    anomalyDetection: boolean;
    recommendations: boolean;
    predictions: boolean;
  };
  customMessages: {
    positiveGrowth?: string;
    negativeGrowth?: string;
    stable?: string;
    anomaly?: string;
  };
  refreshInterval?: number; // Minutes
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InsightsConfigService {
  private readonly STORAGE_KEY = 'dashboard_insights_config';
  private configSubject: BehaviorSubject<InsightsConfig | null>;
  public config$: Observable<InsightsConfig | null>;

  constructor() {
    this.configSubject = new BehaviorSubject<InsightsConfig | null>(this.loadConfig());
    this.config$ = this.configSubject.asObservable();
  }

  getConfig(): InsightsConfig | null {
    return this.configSubject.value;
  }

  updateConfig(updates: Partial<InsightsConfig>): void {
    let config = this.getConfig();
    
    if (!config) {
      config = {
        id: 'insights-config-1',
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
        customMessages: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    config = {
      ...config,
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveConfig(config);
  }

  initializeDefault(): void {
    if (!this.getConfig()) {
      this.updateConfig({});
    }
  }

  private loadConfig(): InsightsConfig | null {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt)
      };
    }
    return null;
  }

  private saveConfig(config: InsightsConfig): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    this.configSubject.next(config);
  }
}

