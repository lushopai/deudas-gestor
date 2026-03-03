import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-settings-push',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="settings-section" *ngIf="pushSupported">
      <div class="section-header">
        <mat-icon class="section-icon">phonelink_ring</mat-icon>
        <span class="section-title">Notificaciones Push</span>
      </div>
      <mat-divider></mat-divider>

      <div class="setting-item">
        <div class="setting-info">
          <mat-icon>{{ pushSubscribed ? 'notifications_active' : 'notifications_off' }}</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Notificaciones del servidor</span>
            <span class="setting-desc">
              {{ pushSubscribed
                 ? 'Recibirás notificaciones cuando se ejecuten gastos recurrentes'
                 : 'Activa para recibir avisos automáticos' }}
            </span>
          </div>
        </div>
        <mat-slide-toggle
          [checked]="pushSubscribed"
          (change)="pushToggled.emit()"
          [disabled]="pushLoading || pushPermission === 'denied'"
          color="primary">
        </mat-slide-toggle>
      </div>

      <div class="setting-item" *ngIf="pushSubscribed">
        <div class="setting-info">
          <mat-icon>send</mat-icon>
          <div class="setting-text">
            <span class="setting-label">Prueba de notificación</span>
            <span class="setting-desc">Enviar una notificación de prueba</span>
          </div>
        </div>
        <button mat-stroked-button color="primary" (click)="pushTested.emit()" [disabled]="pushLoading">
          Probar
        </button>
      </div>

      <div class="push-info" *ngIf="pushPermission === 'denied'">
        <mat-icon>block</mat-icon>
        <div class="push-denied-text">
          <strong>Notificaciones bloqueadas por el navegador</strong>
          <span>En Chrome/Android: toca el candado en la barra de dirección → Notificaciones → Permitir. En iPhone: Ajustes → Safari → Notificaciones → activa este sitio.</span>
        </div>
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

    .push-info {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(244, 67, 54, 0.08);
      border-radius: 8px;
      margin: 8px 16px 12px;
      font-size: 13px;
      color: #c62828;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }
    }

    .push-denied-text {
      display: flex;
      flex-direction: column;
      gap: 4px;

      strong {
        font-size: 13px;
        font-weight: 600;
      }

      span {
        font-size: 12px;
        line-height: 1.4;
        opacity: 0.85;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPushComponent {
  @Input({ required: true }) pushSupported!: boolean;
  @Input({ required: true }) pushSubscribed!: boolean;
  @Input({ required: true }) pushLoading!: boolean;
  @Input({ required: true }) pushPermission!: NotificationPermission;

  @Output() pushToggled = new EventEmitter<void>();
  @Output() pushTested = new EventEmitter<void>();
}
