import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalConfigService } from '../../services/goal-config.service';
import { Goal } from '../goal-tracker/goal-tracker.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-goal-editor',
  templateUrl: './goal-editor.component.html',
  styleUrls: ['./goal-editor.component.css']
})
export class GoalEditorComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  goals: Goal[] = [];
  newGoal: Partial<Goal> = {};
  showAddForm = false;

  colorOptions = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  constructor(private goalConfigService: GoalConfigService) {}

  ngOnInit(): void {
    this.goals = [...this.goalConfigService.getGoals()];
  }

  addGoal(): void {
    this.showAddForm = true;
    this.newGoal = {
      id: `goal-${Date.now()}`,
      title: '',
      current: 0,
      target: 0,
      unit: '',
      color: '#3b82f6'
    };
  }

  saveNewGoal(): void {
    if (!this.newGoal.title || !this.newGoal.target) {
      alert('Please enter goal title and target value');
      return;
    }

    this.goals.push(this.newGoal as Goal);
    this.showAddForm = false;
    this.newGoal = {};
  }

  cancelNewGoal(): void {
    this.showAddForm = false;
    this.newGoal = {};
  }

  removeGoal(index: number): void {
    if (confirm('Delete this goal?')) {
      this.goals.splice(index, 1);
    }
  }

  save(): void {
    this.goalConfigService.updateConfig(this.goals);
    this.saved.emit();
    this.close.emit();
  }

  cancel(): void {
    this.close.emit();
  }
}

