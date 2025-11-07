import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../services/auth.service';

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
  @Input() goalConfigId?: string;
  @Output() edit = new EventEmitter<string>();
  @Input() goals: Goal[] = [];

  constructor(public authService: AuthService) {}

  get showEditButton(): boolean {
    return this.authService.isAuthenticated() && !!this.goalConfigId;
  }

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

  onEdit(event: Event): void {
    event.stopPropagation();
    if (this.goalConfigId) {
      this.edit.emit(this.goalConfigId);
    }
  }
}


