import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface KpiData {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface PeriodData<T> {
  week: T[];
  month: T[];
  year: T[];
}

interface DashboardData {
  kpi: PeriodData<KpiData>;
  revenue: PeriodData<ChartDataPoint>;
  sales: PeriodData<ChartDataPoint>;
  conversion: PeriodData<ChartDataPoint>;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataUrl = 'assets/data/dashboard-data.json';
  private cachedData$: Observable<DashboardData> | null = null;

  constructor(private http: HttpClient) { }

  private getData(): Observable<DashboardData> {
    if (!this.cachedData$) {
      this.cachedData$ = this.http.get<DashboardData>(this.dataUrl).pipe(
        shareReplay(1)
      );
    }
    return this.cachedData$;
  }

  reloadData(): void {
    this.cachedData$ = null;
  }

  getKpiData(period: 'week' | 'month' | 'year'): Observable<KpiData[]> {
    return this.getData().pipe(
      map(data => data.kpi[period])
    );
  }

  getRevenueData(period: 'week' | 'month' | 'year'): Observable<ChartDataPoint[]> {
    return this.getData().pipe(
      map(data => data.revenue[period])
    );
  }

  getSalesData(period: 'week' | 'month' | 'year'): Observable<ChartDataPoint[]> {
    return this.getData().pipe(
      map(data => data.sales[period])
    );
  }

  getConversionData(period: 'week' | 'month' | 'year'): Observable<ChartDataPoint[]> {
    return this.getData().pipe(
      map(data => data.conversion[period])
    );
  }
}



