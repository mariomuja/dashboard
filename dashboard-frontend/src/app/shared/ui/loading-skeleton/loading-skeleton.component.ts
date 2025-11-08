import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'text' | 'circle' | 'rect' | 'card' | 'table';

@Component({
  selector: 'shared-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper">
      <!-- Text skeleton -->
      <div *ngIf="type === 'text'" 
           class="skeleton skeleton-text"
           [style.width]="width"
           [style.height]="height || '1rem'">
      </div>

      <!-- Circle skeleton -->
      <div *ngIf="type === 'circle'"
           class="skeleton skeleton-circle"
           [style.width]="width || '3rem'"
           [style.height]="height || width || '3rem'">
      </div>

      <!-- Rectangle skeleton -->
      <div *ngIf="type === 'rect'"
           class="skeleton skeleton-rect"
           [style.width]="width || '100%'"
           [style.height]="height || '10rem'">
      </div>

      <!-- Card skeleton -->
      <div *ngIf="type === 'card'" class="skeleton-card">
        <div class="skeleton skeleton-rect" style="height: 10rem;"></div>
        <div class="skeleton-card-content">
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
          <div class="skeleton skeleton-text" style="width: 80%; margin-top: 0.5rem;"></div>
          <div class="skeleton skeleton-text" style="width: 40%; margin-top: 0.5rem;"></div>
        </div>
      </div>

      <!-- Table skeleton -->
      <div *ngIf="type === 'table'" class="skeleton-table">
        <div *ngFor="let row of [1,2,3,4,5]" class="skeleton-table-row">
          <div *ngFor="let col of [1,2,3,4]" class="skeleton skeleton-text"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 0.25rem;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .skeleton-text {
      height: 1rem;
      margin-bottom: 0.5rem;
    }

    .skeleton-circle {
      border-radius: 50%;
    }

    .skeleton-rect {
      width: 100%;
    }

    .skeleton-card {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .skeleton-card-content {
      padding: 1rem;
    }

    .skeleton-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-table-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: SkeletonType = 'text';
  @Input() width?: string;
  @Input() height?: string;
}

