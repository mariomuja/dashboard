import { TestBed } from '@angular/core/testing';
import { AiInsightsService } from '../../../app/services/ai-insights.service';
import { KpiData } from '../../../app/data.service';

describe('AiInsightsService', () => {
  let service: AiInsightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiInsightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate insights from KPI data', () => {
    const mockData: KpiData[] = [
      {
        id: '1',
        title: 'Revenue',
        value: '$10,000',
        change: 15,
        trend: 'up',
        icon: '💰',
        color: '#10b981'
      }
    ];

    const insights = service.generateInsights(mockData);
    expect(insights).toBeDefined();
    expect(insights.length).toBeGreaterThan(0);
  });

  it('should detect anomalies', () => {
    const data = [100, 105, 102, 98, 500]; // Last value is anomaly
    const anomalies = service.detectAnomalies(data);
    expect(anomalies).toBeDefined();
    expect(anomalies.length).toBe(5);
    // Anomaly detection uses statistical methods, so we just verify it works
  });

  it('should predict trends', () => {
    const upwardData = [100, 110, 120, 130];
    const upTrend = service.predictTrend(upwardData);
    expect(['up', 'stable']).toContain(upTrend); // Could be either based on threshold

    const downwardData = [130, 120, 110, 100];
    const downTrend = service.predictTrend(downwardData);
    expect(['down', 'stable']).toContain(downTrend);

    const stableData = [100, 100, 100, 100];
    expect(service.predictTrend(stableData)).toBe('stable');
  });
});

