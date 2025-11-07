import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdvancedAnalyticsService } from '../../services/advanced-analytics.service';
import { DataService } from '../../services/data.service';

interface ForecastResult {
  method: string;
  predictions: number[];
  confidence?: { lower: number[], upper: number[] };
  mse?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
}

interface CohortResult {
  cohorts: Array<{
    cohortDate: string;
    cohortSize: number;
    retention: number[];
  }>;
  avgRetention: number[];
}

interface FunnelResult {
  steps: Array<{
    name: string;
    count: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
  overallConversion: number;
}

interface ABTestResult {
  variantA: { mean: number, stdDev: number, sampleSize: number };
  variantB: { mean: number, stdDev: number, sampleSize: number };
  pValue: number;
  isSignificant: boolean;
  confidenceLevel: number;
  uplift: number;
  recommendation: string;
}

@Component({
  selector: 'app-advanced-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advanced-analytics.component.html',
  styleUrls: ['./advanced-analytics.component.css']
})
export class AdvancedAnalyticsComponent implements OnInit {
  // Forecast
  forecastData: number[] = [];
  forecastSteps = 30;
  forecastResult: ForecastResult | null = null;
  selectedForecastMethod: 'arima' | 'prophet' | 'exponential-smoothing' | 'linear-regression' = 'exponential-smoothing';
  
  // Cohort
  cohortResult: CohortResult | null = null;
  
  // Funnel
  funnelResult: FunnelResult | null = null;
  
  // A/B Test
  abTestResult: ABTestResult | null = null;
  variantAData: number[] = [];
  variantBData: number[] = [];
  
  loading = false;
  activeTab: 'forecast' | 'cohort' | 'funnel' | 'abtest' = 'forecast';

  constructor(
    private analyticsService: AdvancedAnalyticsService,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSampleData();
  }

  loadSampleData(): void {
    // Load sample data from the data service
    this.dataService.getRevenueData('week').subscribe(data => {
      // Extract revenue data for forecasting
      this.forecastData = data.map(r => r.value);
    });
  }

  setActiveTab(tab: 'forecast' | 'cohort' | 'funnel' | 'abtest'): void {
    this.activeTab = tab;
  }

  // Forecasting
  runForecast(): void {
    if (this.forecastData.length === 0) {
      alert('No data available for forecasting');
      return;
    }

    this.loading = true;
    try {
      // Convert number array to DataPoint array
      const dataPoints = this.forecastData.map((value, index) => ({
        date: new Date(Date.now() - (this.forecastData.length - index) * 24 * 60 * 60 * 1000),
        value: value
      }));

      const result = this.analyticsService.forecast(
        dataPoints,
        this.forecastSteps,
        this.selectedForecastMethod
      );

      // Convert ForecastResult to our component's format
      this.forecastResult = {
        method: result.method,
        predictions: result.forecast.map(f => f.value),
        confidence: {
          lower: result.forecast.map(f => f.lower),
          upper: result.forecast.map(f => f.upper)
        },
        mse: result.accuracy.rmse * result.accuracy.rmse,
        rmse: result.accuracy.rmse,
        mae: result.accuracy.mae,
        r2: 1 - (result.accuracy.mape / 100)
      };
    } catch (error: any) {
      alert(`Forecast error: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // Cohort Analysis
  runCohortAnalysis(): void {
    this.loading = true;
    try {
      // Sample cohort data with proper format
      const cohortData = [
        { userId: 'user1', cohortDate: new Date('2024-01-01'), eventDate: new Date('2024-01-01') },
        { userId: 'user1', cohortDate: new Date('2024-01-01'), eventDate: new Date('2024-02-01') },
        { userId: 'user1', cohortDate: new Date('2024-01-01'), eventDate: new Date('2024-03-01') },
        { userId: 'user2', cohortDate: new Date('2024-01-01'), eventDate: new Date('2024-01-01') },
        { userId: 'user2', cohortDate: new Date('2024-01-01'), eventDate: new Date('2024-02-01') },
        { userId: 'user3', cohortDate: new Date('2024-02-01'), eventDate: new Date('2024-02-01') },
        { userId: 'user3', cohortDate: new Date('2024-02-01'), eventDate: new Date('2024-03-01') },
        { userId: 'user3', cohortDate: new Date('2024-02-01'), eventDate: new Date('2024-04-01') },
        { userId: 'user4', cohortDate: new Date('2024-02-01'), eventDate: new Date('2024-02-01') },
        { userId: 'user5', cohortDate: new Date('2024-03-01'), eventDate: new Date('2024-03-01') },
        { userId: 'user5', cohortDate: new Date('2024-03-01'), eventDate: new Date('2024-04-01') }
      ];
      
      const result = this.analyticsService.cohortAnalysis(cohortData, 'month', 12);
      
      // Convert to component format
      this.cohortResult = {
        cohorts: result.cohorts.map(c => ({
          cohortDate: c.name,
          cohortSize: c.size,
          retention: c.retention
        })),
        avgRetention: result.averageRetention
      };
    } catch (error: any) {
      alert(`Cohort analysis error: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // Funnel Analysis
  runFunnelAnalysis(): void {
    this.loading = true;
    try {
      // Sample funnel data with proper format
      const funnelData = [
        { name: 'Visit', users: Array.from({ length: 10000 }, (_, i) => `user${i}`) },
        { name: 'Sign Up', users: Array.from({ length: 3000 }, (_, i) => `user${i}`) },
        { name: 'Add to Cart', users: Array.from({ length: 1500 }, (_, i) => `user${i}`) },
        { name: 'Checkout', users: Array.from({ length: 750 }, (_, i) => `user${i}`) },
        { name: 'Purchase', users: Array.from({ length: 500 }, (_, i) => `user${i}`) }
      ];
      
      const result = this.analyticsService.funnelAnalysis(funnelData);
      
      // Convert to component format
      this.funnelResult = {
        steps: result.stages.map(s => ({
          name: s.name,
          count: s.count,
          conversionRate: s.conversionFromPrevious,
          dropoffRate: s.dropoff
        })),
        overallConversion: result.overallConversion
      };
    } catch (error: any) {
      alert(`Funnel analysis error: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  // A/B Test
  runABTest(): void {
    if (this.variantAData.length === 0 || this.variantBData.length === 0) {
      alert('Please enter data for both variants');
      return;
    }

    this.loading = true;
    try {
      // Convert to proper format for the service
      const variantA = {
        users: this.variantAData.length,
        conversions: this.variantAData.reduce((sum, val) => sum + val, 0),
        revenue: this.variantAData.reduce((sum, val) => sum + val, 0)
      };
      
      const variantB = {
        users: this.variantBData.length,
        conversions: this.variantBData.reduce((sum, val) => sum + val, 0),
        revenue: this.variantBData.reduce((sum, val) => sum + val, 0)
      };

      const result = this.analyticsService.abTestAnalysis(
        variantA,
        variantB,
        0.95
      );
      
      // Calculate means and std devs from arrays
      const meanA = this.variantAData.reduce((a, b) => a + b, 0) / this.variantAData.length;
      const meanB = this.variantBData.reduce((a, b) => a + b, 0) / this.variantBData.length;
      const stdDevA = Math.sqrt(this.variantAData.reduce((a, b) => a + Math.pow(b - meanA, 2), 0) / this.variantAData.length);
      const stdDevB = Math.sqrt(this.variantBData.reduce((a, b) => a + Math.pow(b - meanB, 2), 0) / this.variantBData.length);
      
      // Convert to component format
      this.abTestResult = {
        variantA: { mean: meanA, stdDev: stdDevA, sampleSize: this.variantAData.length },
        variantB: { mean: meanB, stdDev: stdDevB, sampleSize: this.variantBData.length },
        pValue: result.pValue,
        isSignificant: result.statisticalSignificance,
        confidenceLevel: result.confidence,
        uplift: result.effect.relative,
        recommendation: result.recommendation
      };
    } catch (error: any) {
      alert(`A/B test error: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  parseNumberArray(input: string): number[] {
    return input
      .split(',')
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}

}
