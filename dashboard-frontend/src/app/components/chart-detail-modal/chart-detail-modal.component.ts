import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ChartDataPoint } from '../../services/data.service';

@Component({
  selector: 'app-chart-detail-modal',
  templateUrl: './chart-detail-modal.component.html',
  styleUrls: ['./chart-detail-modal.component.css'],
  standalone: true,
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ChartDetailModalComponent {
  @Input() title: string = '';
  @Input() data: ChartDataPoint[] = [];
  @Input() period: string = '';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  getTotalValue(): number {
    return this.data.reduce((sum, item) => sum + item.value, 0);
  }

  getAverageValue(): number {
    return this.data.length > 0 ? this.getTotalValue() / this.data.length : 0;
  }

  getMaxValue(): ChartDataPoint | null {
    if (this.data.length === 0) return null;
    return this.data.reduce((max, item) => item.value > max.value ? item : max);
  }

  getMinValue(): ChartDataPoint | null {
    if (this.data.length === 0) return null;
    return this.data.reduce((min, item) => item.value < min.value ? item : min);
  }

  exportDetailedData(): void {
    const csv = [
      ['Label', 'Value'],
      ...this.data.map(d => [d.label, d.value.toString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.title.toLowerCase().replace(/\s+/g, '-')}-details.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

