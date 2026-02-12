import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { PagoService, Pago } from '../../../core/services/pago.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-historial-pagos',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    EmptyStateComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './historial-pagos.html',
  styleUrl: './historial-pagos.scss',
})
export class HistorialPagos implements OnInit {
  pagos: Pago[] = [];
  cargando = true;
  error: string | null = null;
  errorPareja = false;
  usuarioActualId: number | null = null;

  constructor(
    private pagoService: PagoService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();
    this.usuarioActualId = usuario?.id || null;
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.error = null;
    this.errorPareja = false;

    this.pagoService.obtenerHistorial().subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        if (err.status === 400 && err.error?.mensaje?.includes('pareja')) {
          this.errorPareja = true;
          this.error = null;
        } else {
          this.error = 'No se pudo cargar el historial de pagos';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  esPagadorActual(pago: Pago): boolean {
    return pago.pagador.id === this.usuarioActualId;
  }

  async cancelarPago(pago: Pago): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      'Esta acción no se puede deshacer',
      '¿Estás seguro de cancelar este pago?'
    );

    if (confirmed) {
      this.loadingService.show('Cancelando pago...');
      this.pagoService.cancelarPago(pago.id).subscribe({
        next: () => {
          this.loadingService.hide();
          this.notificationService.success('Pago cancelado exitosamente');
          this.cargarHistorial();
        },
        error: (err) => {
          this.loadingService.hide();
          // El error se maneja automáticamente en el interceptor
        }
      });
    }
  }

  abonarPago(): void {
    this.router.navigate(['/deudas/abonar']);
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  configurarPareja(): void {
    this.router.navigate(['/pareja/configurar']);
  }

  getMetodoPagoLabel(metodo: string): string {
    const labels: Record<string, string> = {
      EFECTIVO: 'Efectivo',
      TRANSFERENCIA: 'Transferencia',
      TARJETA: 'Tarjeta',
      OTRO: 'Otro'
    };
    return labels[metodo] || metodo;
  }

  getMetodoPagoIcon(metodo: string): string {
    const icons: Record<string, string> = {
      EFECTIVO: 'payments',
      TRANSFERENCIA: 'account_balance',
      TARJETA: 'credit_card',
      OTRO: 'more_horiz'
    };
    return icons[metodo] || 'payment';
  }
}
