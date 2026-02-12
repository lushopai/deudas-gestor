import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="skeleton-wrapper">
      @for (i of items; track i) {
        <div class="skeleton-item" [class]="tipo">
          @switch (tipo) {
            @case ('card') {
              <div class="skeleton-card">
                <div class="sk-line sk-w60 sk-h14"></div>
                <div class="sk-line sk-w40 sk-h20"></div>
                <div class="sk-line sk-w80 sk-h12"></div>
              </div>
            }
            @case ('list-item') {
              <div class="skeleton-list-item">
                <div class="sk-circle"></div>
                <div class="sk-text-block">
                  <div class="sk-line sk-w70 sk-h14"></div>
                  <div class="sk-line sk-w40 sk-h12"></div>
                </div>
                <div class="sk-line sk-w20 sk-h16"></div>
              </div>
            }
            @case ('summary') {
              <div class="skeleton-summary">
                <div class="sk-circle-sm"></div>
                <div class="sk-text-block">
                  <div class="sk-line sk-w50 sk-h12"></div>
                  <div class="sk-line sk-w60 sk-h18"></div>
                </div>
              </div>
            }
            @case ('table-row') {
              <div class="skeleton-table-row">
                <div class="sk-line sk-w50 sk-h14"></div>
                <div class="sk-line sk-w20 sk-h14"></div>
                <div class="sk-line sk-w25 sk-h14"></div>
                <div class="sk-line sk-w15 sk-h14"></div>
              </div>
            }
            @default {
              <div class="skeleton-card">
                <div class="sk-line sk-w70 sk-h14"></div>
                <div class="sk-line sk-w50 sk-h12"></div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-item {
      background: var(--bg-primary, white);
      border-radius: 12px;
      overflow: hidden;
    }

    .skeleton-item.summary {
      background: transparent;
    }

    /* Skeleton Card */
    .skeleton-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Skeleton List Item */
    .skeleton-list-item {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sk-text-block {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Skeleton Summary (resumen cards) */
    .skeleton-summary {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--bg-primary, white);
      border-radius: 12px;
    }

    /* Skeleton Table Row */
    .skeleton-table-row {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid var(--border-color, #eee);
    }

    /* Skeleton Base Elements */
    .sk-line {
      border-radius: 4px;
      background: linear-gradient(90deg,
        var(--skeleton-base, #e8e8e8) 25%,
        var(--skeleton-shine, #f5f5f5) 50%,
        var(--skeleton-base, #e8e8e8) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .sk-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
      background: linear-gradient(90deg,
        var(--skeleton-base, #e8e8e8) 25%,
        var(--skeleton-shine, #f5f5f5) 50%,
        var(--skeleton-base, #e8e8e8) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .sk-circle-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
      background: linear-gradient(90deg,
        var(--skeleton-base, #e8e8e8) 25%,
        var(--skeleton-shine, #f5f5f5) 50%,
        var(--skeleton-base, #e8e8e8) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    /* Widths */
    .sk-w15 { width: 15%; }
    .sk-w20 { width: 20%; }
    .sk-w25 { width: 25%; }
    .sk-w40 { width: 40%; }
    .sk-w50 { width: 50%; }
    .sk-w60 { width: 60%; }
    .sk-w70 { width: 70%; }
    .sk-w80 { width: 80%; }

    /* Heights */
    .sk-h12 { height: 12px; }
    .sk-h14 { height: 14px; }
    .sk-h16 { height: 16px; }
    .sk-h18 { height: 18px; }
    .sk-h20 { height: 20px; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() tipo: 'card' | 'list-item' | 'summary' | 'table-row' = 'card';
  @Input() cantidad = 3;

  get items(): number[] {
    return Array.from({ length: this.cantidad }, (_, i) => i);
  }
}
