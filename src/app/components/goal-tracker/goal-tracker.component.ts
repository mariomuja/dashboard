import { Component, Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

@Component({
  selector: 'app-goal-tracker',
  templateUrl: './goal-tracker.component.html',
  styleUrls: ['./goal-tracker.component.css'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('progressAnimation', [
      transition(':enter', [
        style({ width: 0 }),
        animate('1s ease-out')
      ])
    ])
  ]
})
export class GoalTrackerComponent {
  @Input() goals: Goal[] = [
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

  getProgress(goal: Goal): number {
    return Math.min((goal.current / goal.target) * 100, 100);
  }

  formatValue(value: number, unit: string): string {
    if (unit === '$') {
      return `$${value.toLocaleString('en-US')}`;
    } else if (unit === '%') {
      return `${value}%`;
    }
    return value.toLocaleString('en-US');
  }
}

