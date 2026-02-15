import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings-appearance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  template: `
    <mat-card class="settings-section">
      <div class="section-header">
        <mat-icon class="section-icon">palette</mat-icon>
        <span class="section-title">Apariencia</span>
      </div>
      <mat-divider></mat-divider>

      <div class="setting-item">
        <div class="setting-info">
          <mat-icon>{{ darkMode ? 'dark_mode' : 'light_mode' }}</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Modo Oscuro</span>
            <span class="setting-desc">Cambia la apariencia de la app</span>
          </div>
        </div>
        <mat-slide-toggle
          [checked]="darkMode"
          (change)="darkModeToggled.emit()"
          color="primary">
        </mat-slide-toggle>
      </div>
    </mat-card>
  `,
  styles: [`
    .settings-section {
      border-radius: 12px;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;

      .section-icon {
        color: var(--primary-color, #1976d2);
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary, rgba(0,0,0,0.87));
      }
    }

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.06));

      &:last-child {
        border-bottom: none;
      }
    }

    .setting-info {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;

      mat-icon {
        color: var(--text-secondary, rgba(0,0,0,0.54));
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .setting-text {
      display: flex;
      flex-direction: column;
    }

    .setting-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary, rgba(0,0,0,0.87));
    }

    .setting-desc {
      font-size: 12px;
      color: var(--text-secondary, rgba(0,0,0,0.54));
      margin-top: 2px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsAppearanceComponent {
  @Input({ required: true }) darkMode!: boolean;
  @Output() darkModeToggled = new EventEmitter<void>();
}
