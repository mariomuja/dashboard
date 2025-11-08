import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSkeletonComponent as SharedLoadingSkeletonComponent, SkeletonType } from '../../shared/ui';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule, SharedLoadingSkeletonComponent],
  template: `
    <div *ngFor="let item of items">
      <shared-loading-skeleton 
        [type]="type === 'kpi' ? 'card' : 'rect'" 
        [width]="type === 'kpi' ? '100%' : '100%'"
        [height]="type === 'chart' ? '300px' : undefined">
      </shared-loading-skeleton>
    </div>
  `
})
export class LoadingSkeletonComponent {
  @Input() type: 'kpi' | 'chart' = 'kpi';
  @Input() count: number = 1;

  get items(): number[] {
    return Array(this.count).fill(0);
  }
}

