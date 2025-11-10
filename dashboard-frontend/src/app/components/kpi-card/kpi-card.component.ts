import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { KpiData } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { CountUpDirective } from '../../directives/count-up.directive';

@Component({
  standalone: true,
  imports: [CommonModule, CountUpDirective],
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class KpiCardComponent {
  @Input() kpi!: KpiData;
  @Input() kpiConfigId?: string; // ID for KPI configuration
  @Output() edit = new EventEmitter<string>(); // Emit config ID when edit is clicked
  
  Math = Math;

  constructor(public authService: AuthService) {}

  get showEditButton(): boolean {
    return this.authService.isAuthenticated() && !!this.kpiConfigId;
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    if (this.kpiConfigId) {
      this.edit.emit(this.kpiConfigId);
    }
  }
  
  // Helper methods for formatting
  hasPrefix(value: string): boolean {
    if (!value) return false;
    return value.startsWith('$') || value.startsWith('€') || value.startsWith('£');
  }
  
  getPrefix(value: string): string {
    if (!value) return '';
    if (value.startsWith('$')) return '$';
    if (value.startsWith('€')) return '€';
    if (value.startsWith('£')) return '£';
    return '';
  }
  
  hasSuffix(value: string): boolean {
    if (!value) return false;
    return value.endsWith('%') || value.endsWith('/5') || value.includes('/');
  }
  
  getSuffix(value: string): string {
    if (!value) return '';
    if (value.endsWith('%')) return '%';
    if (value.includes('/5')) return '/5';
    if (value.includes('/')) {
      const match = value.match(/\/\d+$/);
      return match ? match[0] : '';
    }
    return '';
  }
}



