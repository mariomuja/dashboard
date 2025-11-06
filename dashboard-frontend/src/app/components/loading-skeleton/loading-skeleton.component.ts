import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.css']
})
export class LoadingSkeletonComponent {
  @Input() type: 'kpi' | 'chart' = 'kpi';
  @Input() count: number = 1;

  get items(): number[] {
    return Array(this.count).fill(0);
  }
}

