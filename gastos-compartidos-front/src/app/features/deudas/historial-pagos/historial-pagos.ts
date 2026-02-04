import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PagoService, Pago } from '../../../core/services/pago.service';
import { AuthService } from '../../../core/services/auth.service';

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
    MatSnackBarModule
  ],
  templateUrl: './historial-pagos.html',
  styleUrl: './historial-pagos.scss',
})
export class HistorialPagos implements OnInit {
  pagos: Pago[] = [];
  cargando = true;
  error: string | null = null;
  usuarioActualId: number | null = null;

  constructor(
    private pagoService: PagoService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();
    this.usuarioActualId = usuario?.id || null;
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.error = null;

    this.pagoService.obtenerHistorial().subscribe({
      next: (pagos) => {
        this.pagos = pagos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.error = 'No se pudo cargar el historial de pagos';
        this.cargando = false;
      }
    });
  }

  esPagadorActual(pago: Pago): boolean {
    return pago.pagador.id === this.usuarioActualId;
  }

  cancelarPago(pago: Pago): void {
    if (confirm('¿Estás seguro de cancelar este pago?')) {
      this.pagoService.cancelarPago(pago.id).subscribe({
        next: () => {
          this.snackBar.open('Pago cancelado', 'OK', { duration: 3000 });
          this.cargarHistorial();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al cancelar el pago';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
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
