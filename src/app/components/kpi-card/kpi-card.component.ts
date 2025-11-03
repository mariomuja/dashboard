import { Component, Input } from '@angular/core';
import { KpiData } from '../../services/data.service';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css']
})
export class KpiCardComponent {
  @Input() kpi!: KpiData;
}



