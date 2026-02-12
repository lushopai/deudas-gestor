import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state-container">
      <div class="empty-icon-wrapper">
        <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-title">{{ titulo }}</h3>
      @if (subtitulo) {
        <p class="empty-subtitle">{{ subtitulo }}</p>
      }
      @if (accionTexto) {
        <button mat-raised-button color="primary" class="empty-action" (click)="accionClick.emit()">
          @if (accionIcono) {
            <mat-icon>{{ accionIcono }}</mat-icon>
          }
          {{ accionTexto }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      gap: 8px;
    }

    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--bg-tertiary, #f5f5f5);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .empty-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: var(--text-tertiary, #999);
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary, #333);
      margin: 0;
    }

    .empty-subtitle {
      font-size: 14px;
      color: var(--text-secondary, #666);
      margin: 0;
      max-width: 300px;
      line-height: 1.4;
    }

    .empty-action {
      margin-top: 12px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() titulo = 'Sin datos';
  @Input() subtitulo = '';
  @Input() accionTexto = '';
  @Input() accionIcono = 'add';
  @Output() accionClick = new EventEmitter<void>();
}
