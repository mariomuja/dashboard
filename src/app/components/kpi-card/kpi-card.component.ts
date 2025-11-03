import { Component, Input } from '@angular/core';
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
  Math = Math;
}



