import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.css'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class DateRangePickerComponent {
  @Output() dateRangeSelected = new EventEmitter<DateRange>();
  
  showPicker = false;
  startDate: string = '';
  endDate: string = '';
  
  // Quick selection presets
  presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Month', days: 0, type: 'month' },
    { label: 'Last Month', days: 0, type: 'lastMonth' },
    { label: 'This Year', days: 0, type: 'year' }
  ];

  togglePicker(): void {
    this.showPicker = !this.showPicker;
  }

  applyDateRange(): void {
    if (!this.startDate || !this.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (start > end) {
      alert('Start date must be before end date');
      return;
    }

    this.dateRangeSelected.emit({
      startDate: start,
      endDate: end,
      label: this.formatDateRange(start, end)
    });

    this.showPicker = false;
  }

  selectPreset(preset: any): void {
    const end = new Date();
    let start = new Date();

    if (preset.type === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.type === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0); // Last day of previous month
    } else if (preset.type === 'year') {
      start = new Date(end.getFullYear(), 0, 1);
    } else {
      start.setDate(end.getDate() - preset.days);
    }

    this.dateRangeSelected.emit({
      startDate: start,
      endDate: end,
      label: preset.label
    });

    this.showPicker = false;
  }

  private formatDateRange(start: Date, end: Date): string {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }

  clearSelection(): void {
    this.startDate = '';
    this.endDate = '';
  }
}


