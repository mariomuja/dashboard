import { Injectable } from '@angular/core';
import { KpiData } from './data.service';

export interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation?: string;
  confidence: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class AiInsightsService {

  generateInsights(kpiData: KpiData[]): Insight[] {
    const insights: Insight[] = [];

    kpiData.forEach(kpi => {
      // Trend-based insights
      if (kpi.trend === 'up' && Math.abs(kpi.change) > 10) {
        insights.push({
          id: `${kpi.id}-growth`,
          type: 'positive',
          title: `Strong Growth in ${kpi.title}`,
          description: `${kpi.title} has increased by ${kpi.change}% this period, indicating strong performance.`,
          recommendation: 'Consider increasing investment in this area to maintain momentum.',
          confidence: 85
        });
      }

      if (kpi.trend === 'down' && Math.abs(kpi.change) > 5) {
        insights.push({
          id: `${kpi.id}-decline`,
          type: 'negative',
          title: `Declining ${kpi.title}`,
          description: `${kpi.title} has decreased by ${Math.abs(kpi.change)}% this period.`,
          recommendation: 'Investigate root causes and implement corrective measures.',
          confidence: 90
        });
      }

      if (kpi.trend === 'stable' && Math.abs(kpi.change) < 2) {
        insights.push({
          id: `${kpi.id}-stable`,
          type: 'info',
          title: `${kpi.title} Remains Stable`,
          description: `${kpi.title} shows minimal change (${kpi.change}%), indicating stability.`,
          confidence: 75
        });
      }
    });

    // Anomaly detection (simplified)
    const changes = kpiData.map(kpi => Math.abs(kpi.change));
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    
    kpiData.forEach(kpi => {
      if (Math.abs(kpi.change) > avgChange * 2) {
        insights.push({
          id: `${kpi.id}-anomaly`,
          type: 'warning',
          title: `Unusual Activity Detected`,
          description: `${kpi.title} shows abnormal variation (${kpi.change}%) compared to other metrics.`,
          recommendation: 'Review recent changes or events that may have caused this variation.',
          confidence: 70
        });
      }
    });

    // Correlation insights
    const revenueKpi = kpiData.find(k => k.title.toLowerCase().includes('revenue'));
    const customerKpi = kpiData.find(k => k.title.toLowerCase().includes('customer'));
    
    if (revenueKpi && customerKpi && revenueKpi.trend === customerKpi.trend) {
      insights.push({
        id: 'correlation-revenue-customers',
        type: 'info',
        title: 'Revenue-Customer Correlation',
        description: 'Revenue and customer metrics are moving in the same direction, showing healthy correlation.',
        confidence: 80
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  detectAnomalies(data: number[]): boolean[] {
    if (data.length < 3) return data.map(() => false);

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    const threshold = 2; // 2 standard deviations
    
    return data.map(value => Math.abs(value - mean) > threshold * stdDev);
  }

  predictTrend(historicalData: number[]): 'up' | 'down' | 'stable' {
    if (historicalData.length < 2) return 'stable';
    
    // Simple linear regression
    const n = historicalData.length;
    const xMean = (n - 1) / 2;
    const yMean = historicalData.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (historicalData[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    
    const slope = numerator / denominator;
    
    if (slope > 0.1) return 'up';
    if (slope < -0.1) return 'down';
    return 'stable';
  }
}

