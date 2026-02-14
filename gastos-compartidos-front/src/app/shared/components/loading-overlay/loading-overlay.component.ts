import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadingService.loading()) {
      <div class="loading-overlay">
        <div class="loading-content">
          <mat-progress-spinner
            diameter="60"
            mode="indeterminate"
            color="primary">
          </mat-progress-spinner>
          <div class="loading-message">{{ loadingService.message() }}</div>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      background: white;
      padding: 32px 48px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .loading-message {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      text-align: center;
    }
  `]
})
export class LoadingOverlayComponent {
  constructor(public loadingService: LoadingService) {}
}
