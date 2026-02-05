import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PagoService, ResumenDeuda } from '../../../core/services/pago.service';

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
})
export class BalanceCard implements OnInit {
  resumen: ResumenDeuda | null = null;
  cargando = true;
  error: string | null = null;
  necesitaPareja = false;

  constructor(
    private pagoService: PagoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando = true;
    this.error = null;
    this.necesitaPareja = false;

    this.pagoService.obtenerResumenDeuda().subscribe({
      next: (resumen) => {
        this.resumen = resumen;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);

        // Detectar si el error es por falta de pareja
        if (err.status === 400 && err.error?.mensaje?.includes('pareja')) {
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

  configurarPareja(): void {
    this.router.navigate(['/pareja/configurar']);
  }

  getColorBalance(): string {
    if (!this.resumen || this.resumen.saldoPendiente === 0) {
      return 'balanced'; // Verde si están a mano
    }
    return this.resumen.deudor ? 'owe' : 'owed'; // Naranja si debes, azul si te deben
  }
}
