import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from '../components/goal-tracker/goal-tracker.component';

export interface GoalConfig {
  id: string;
  goals: Goal[];
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GoalConfigService {
  private readonly STORAGE_KEY = 'dashboard_goal_config';
  private configSubject: BehaviorSubject<GoalConfig | null>;
  public config$: Observable<GoalConfig | null>;

  constructor() {
    this.configSubject = new BehaviorSubject<GoalConfig | null>(this.loadConfig());
    this.config$ = this.configSubject.asObservable();
  }

  getConfig(): GoalConfig | null {
    return this.configSubject.value;
  }

  updateConfig(goals: Goal[]): void {
    let config = this.getConfig();
    
    if (!config) {
      config = {
        id: 'goal-config-1',
        goals: goals,
        visible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else {
      config = {
        ...config,
        goals: goals,
        updatedAt: new Date()
      };
    }
    
    this.saveConfig(config);
  }

  getGoals(): Goal[] {
    const config = this.getConfig();
    return config?.goals || this.getDefaultGoals();
  }

  private getDefaultGoals(): Goal[] {
    return [
      {
        id: '1',
        title: 'Monthly Revenue Target',
        current: 124563,
        target: 150000,
        unit: '$',
        color: '#10b981'
      },
      {
        id: '2',
        title: 'New Customer Goal',
        current: 1234,
        target: 1500,
        unit: '',
        color: '#3b82f6'
      },
      {
        id: '3',
        title: 'Conversion Rate Goal',
        current: 3.24,
        target: 4.0,
        unit: '%',
        color: '#8b5cf6'
      }
    ];
  }

  initializeDefaultGoals(): void {
    if (!this.getConfig()) {
      this.updateConfig(this.getDefaultGoals());
    }
  }

  private loadConfig(): GoalConfig | null {
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

  private saveConfig(config: GoalConfig): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    this.configSubject.next(config);
  }
}

