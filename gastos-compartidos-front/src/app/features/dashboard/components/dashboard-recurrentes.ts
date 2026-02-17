import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GastoRecurrente } from '../../../core/services/gasto-recurrente.service';
import { TranslateModule } from '@ngx-translate/core';
import { ClpPipe } from '../../../shared/pipes/clp.pipe';

@Component({
  selector: 'app-dashboard-recurrentes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule,
    ClpPipe
  ],
  template: `
    @if (proximosRecurrentes.length > 0) {
      <mat-card class="recurrentes-card" (click)="cardClick.emit()">
        <mat-card-content>
          <div class="recurrentes-header">
            <div class="recurrentes-icon">
              <mat-icon>autorenew</mat-icon>
            </div>
            <div class="recurrentes-info">
              <span class="recurrentes-label">{{ 'DASHBOARD.RECURRING_EXPENSES' | translate }}</span>
              <span class="recurrentes-count">{{ proximosRecurrentes.length }}</span>
            </div>
            <mat-icon class="arrow-icon">chevron_right</mat-icon>
          </div>
          <div class="recurrentes-lista">
            @for (gr of proximosRecurrentes; track gr.id) {
              <div class="recurrente-item">
                <span class="recurrente-desc">{{ gr.descripcion }}</span>
                <span class="recurrente-monto">{{ gr.monto | clp }}</span>
                <span class="recurrente-dias">
                  @if (gr.diasHastaProxima <= 0) {
                    Hoy
                  } @else if (gr.diasHastaProxima === 1) {
                    Mañana
                  } @else {
                    En {{ gr.diasHastaProxima }}d
                  }
                </span>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .recurrentes-card {
      background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%) !important;
      color: white !important;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      * {
        color: white !important;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(171, 71, 188, 0.3);
      }

      mat-card-content {
        padding: 16px !important;
      }

      .recurrentes-header {
        display: flex;
        align-items: center;
        gap: 12px;

        .recurrentes-icon {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 10px;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
        }

        .recurrentes-info {
          flex: 1;

          .recurrentes-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
          }

          .recurrentes-count {
            display: block;
            font-size: 12px;
            opacity: 0.85;
          }
        }

        .arrow-icon {
          opacity: 0.7;
        }
      }

      .recurrentes-lista {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);

        .recurrente-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 13px;

          .recurrente-desc {
            flex: 1;
            opacity: 0.95;
          }

          .recurrente-monto {
            font-weight: 600;
          }

          .recurrente-dias {
            font-size: 11px;
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 8px;
            border-radius: 10px;
            min-width: 50px;
            text-align: center;
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardRecurrentesComponent {
  @Input({ required: true }) proximosRecurrentes!: GastoRecurrente[];
  @Output() cardClick = new EventEmitter<void>();
}
