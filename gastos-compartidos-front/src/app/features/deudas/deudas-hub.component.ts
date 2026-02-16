import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BalanceCard } from './balance-card/balance-card';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-deudas-hub',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    BalanceCard
  ],
  template: `
    <div class="deudas-container">
      <!-- Toolbar -->
      <mat-toolbar color="primary" class="deudas-toolbar">
        <button mat-icon-button (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title">Deudas Compartidas</span>
      </mat-toolbar>

      <!-- Contenido Principal -->
      <div class="deudas-content">
        <!-- Child Routes Outlet (Abonar Pago, Historial) -->
        <router-outlet></router-outlet>

        <!-- Si no hay child route activa, mostrar el hub principal -->
        @if (!isChildRoute) {
          <!-- Balance Card (sin botones redundantes) -->
          <app-balance-card [mostrarBotones]="false"></app-balance-card>

          <!-- Acciones Rápidas -->
          <mat-card class="acciones-card">
            <mat-card-header>
              <mat-card-title>Acciones</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>

            <mat-card-content class="acciones-content">
              <button mat-raised-button color="primary" (click)="abonarPago()" class="accion-btn">
                <mat-icon>payment</mat-icon>
                <span>Abonar Pago</span>
              </button>

              <button mat-stroked-button (click)="verHistorial()" class="accion-btn">
                <mat-icon>history</mat-icon>
                <span>Ver Historial</span>
              </button>
            </mat-card-content>
          </mat-card>

          <!-- Info Útil -->
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>¿Cómo funciona?</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>

            <mat-card-content class="info-content">
              <div class="info-item">
                <mat-icon class="info-icon">attach_money</mat-icon>
                <div>
                  <h4>Abonar Pago</h4>
                  <p>Registra un pago a tu pareja con monto, fecha y método de pago</p>
                </div>
              </div>

              <div class="info-item">
                <mat-icon class="info-icon">list_alt</mat-icon>
                <div>
                  <h4>Ver Historial</h4>
                  <p>Consulta todos los pagos registrados entre ustedes</p>
                </div>
              </div>

              <div class="info-item">
                <mat-icon class="info-icon">check_circle</mat-icon>
                <div>
                  <h4>Balance Actualizado</h4>
                  <p>Tu saldo se actualiza automáticamente con cada pago</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .deudas-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f5f5f5;
    }

    .deudas-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
      flex: 1;
    }

    .deudas-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .acciones-card {
      border-radius: 12px;
      overflow: hidden;
    }

    .acciones-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
    }

    .accion-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      padding: 12px;
      height: 48px;
      border-radius: 8px;
      font-weight: 500;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        flex: 1;
      }
    }

    .info-card {
      border-radius: 12px;
      overflow: hidden;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .info-item {
      display: flex;
      gap: 16px;
      align-items: flex-start;

      .info-icon {
        color: var(--primary-color, #1976d2);
        margin-top: 4px;
        flex-shrink: 0;
      }

      h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.87);
      }

      p {
        margin: 0;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.54);
        line-height: 1.4;
      }
    }

    @media (max-width: 600px) {
      .deudas-container {
        height: auto;
      }

      .deudas-content {
        overflow-y: visible;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeudasHubComponent implements OnInit, OnDestroy {
  isChildRoute = false;
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Detectar si hay child route activa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      // Si la URL contiene /abonar o /historial, hay child route activa
      this.isChildRoute = url.includes('/deudas/abonar') || url.includes('/deudas/historial');
      // Marcar componente para redetección de cambios
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  abonarPago(): void {
    this.router.navigate(['/deudas/abonar']);
  }

  verHistorial(): void {
    this.router.navigate(['/deudas/historial']);
  }
}
