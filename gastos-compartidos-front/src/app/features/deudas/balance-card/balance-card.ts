import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PagoService, ResumenDeuda } from '../../../core/services/pago.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './balance-card.html',
  styleUrl: './balance-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalanceCard implements OnInit, OnDestroy {
  @Input() mostrarBotones = true; // Control si muestra botones (false en hub para evitar redundancia)
  
  private destroy$ = new Subject<void>();
  resumen: ResumenDeuda | null = null;
  cargando = true;
  error: string | null = null;
  necesitaPareja = false;

  constructor(
    private pagoService: PagoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando = true;
    this.error = null;
    this.necesitaPareja = false;

    this.pagoService.obtenerResumenDeuda().pipe(takeUntil(this.destroy$)).subscribe({
      next: (resumen) => {
        this.resumen = resumen;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);

        // Detectar si el error es por falta de pareja completa (2 usuarios)
        const mensaje = err.error?.mensaje || err.error?.message || '';
        if (err.status === 400 && (mensaje.includes('pareja') || mensaje.includes('2 usuarios'))) {
          this.necesitaPareja = true;
          this.error = null;
        } else {
          this.error = 'Error al cargar el balance de deudas';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abonarPago(): void {
    this.router.navigate(['/deudas/abonar']);
  }

  verHistorial(): void {
    this.router.navigate(['/deudas/historial']);
  }

  abrirDeudas(): void {
    this.router.navigate(['/deudas']);
  }

  configurarPareja(): void {
    this.router.navigate(['/pareja/configurar']);
  }

  getColorBalance(): string {
    if (!this.resumen || this.resumen.saldoPendiente === 0) {
      return 'balanced'; // Verde si están a mano
    }
    return this.resumen.deudor ? 'owe' : 'owed'; // Naranja si debes, azul si te deben
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
