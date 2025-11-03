import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class DataService {
  getKpiData(): Observable<KpiData[]> {
    return of([
      {
        id: '1',
        title: 'Total Revenue',
        value: '$124,563',
        change: 12.5,
        trend: 'up',
        icon: '💰',
        color: '#10b981'
      },
      {
        id: '2',
        title: 'New Customers',
        value: '1,234',
        change: -3.2,
        trend: 'down',
        icon: '👥',
        color: '#3b82f6'
      },
      {
        id: '3',
        title: 'Conversion Rate',
        value: '3.24%',
        change: 8.1,
        trend: 'up',
        icon: '📈',
        color: '#8b5cf6'
      },
      {
        id: '4',
        title: 'Avg. Order Value',
        value: '$89.42',
        change: 2.3,
        trend: 'up',
        icon: '🛒',
        color: '#f59e0b'
      }
    ]);
  }

  getRevenueData(): Observable<ChartDataPoint[]> {
    return of([
      { label: 'Jan', value: 45000 },
      { label: 'Feb', value: 52000 },
      { label: 'Mar', value: 48000 },
      { label: 'Apr', value: 61000 },
      { label: 'May', value: 55000 },
      { label: 'Jun', value: 67000 },
      { label: 'Jul', value: 72000 },
      { label: 'Aug', value: 68000 },
      { label: 'Sep', value: 75000 },
      { label: 'Oct', value: 80000 },
      { label: 'Nov', value: 78000 },
      { label: 'Dec', value: 85000 }
    ]);
  }

  getSalesData(): Observable<ChartDataPoint[]> {
    return of([
      { label: 'Jan', value: 120 },
      { label: 'Feb', value: 145 },
      { label: 'Mar', value: 132 },
      { label: 'Apr', value: 168 },
      { label: 'May', value: 155 },
      { label: 'Jun', value: 189 },
      { label: 'Jul', value: 205 },
      { label: 'Aug', value: 192 },
      { label: 'Sep', value: 218 },
      { label: 'Oct', value: 235 },
      { label: 'Nov', value: 228 },
      { label: 'Dec', value: 245 }
    ]);
  }

  getConversionData(): Observable<ChartDataPoint[]> {
    return of([
      { label: 'Jan', value: 2.8 },
      { label: 'Feb', value: 3.1 },
      { label: 'Mar', value: 2.9 },
      { label: 'Apr', value: 3.4 },
      { label: 'May', value: 3.2 },
      { label: 'Jun', value: 3.6 },
      { label: 'Jul', value: 3.8 },
      { label: 'Aug', value: 3.5 },
      { label: 'Sep', value: 3.9 },
      { label: 'Oct', value: 4.1 },
      { label: 'Nov', value: 3.7 },
      { label: 'Dec', value: 4.2 }
    ]);
  }
}



