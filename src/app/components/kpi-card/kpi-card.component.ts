import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { KpiData } from '../../services/data.service';

@Component({
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
  @Input() showEditButton = true; // Whether to show edit button
  @Output() edit = new EventEmitter<string>(); // Emit config ID when edit is clicked
  
  Math = Math;

  onEdit(event: Event): void {
    event.stopPropagation();
    if (this.kpiConfigId) {
      this.edit.emit(this.kpiConfigId);
    }
  }
}



