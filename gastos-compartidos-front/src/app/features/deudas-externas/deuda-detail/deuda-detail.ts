import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import {
  DeudaService,
  Deuda,
  AbonoDeuda,
  TIPO_DEUDA_LABELS,
  ESTADO_DEUDA_LABELS,
  METODO_PAGO_LABELS
} from '../../../core/services/deuda.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClpPipe } from '../../../shared/pipes/clp.pipe';

@Component({
  selector: 'app-deuda-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    ClpPipe
  ],
  templateUrl: './deuda-detail.html',
  styleUrl: './deuda-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeudaDetail implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  deuda: Deuda | null = null;
  abonos: AbonoDeuda[] = [];
  cargando = true;
  deudaId!: number;

  tipoDeudaLabels = TIPO_DEUDA_LABELS;
  estadoDeudaLabels = ESTADO_DEUDA_LABELS;
  metodoPagoLabels = METODO_PAGO_LABELS;

  constructor(
    private deudaService: DeudaService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.deudaId = +id;
      this.cargarDeuda();
      this.cargarAbonos();
    }
  }

  cargarDeuda(): void {
    this.cargando = true;
    this.deudaService.obtenerDeuda(this.deudaId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (deuda) => {
        this.deuda = deuda;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Deuda no encontrada');
        this.router.navigate(['/deudas-externas']);
      }
    });
  }

  cargarAbonos(): void {
    this.deudaService.obtenerAbonos(this.deudaId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (abonos) => {
        this.abonos = abonos;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/deudas-externas']);
  }

  editarDeuda(): void {
    this.router.navigate(['/deudas-externas', this.deudaId, 'editar']);
  }

  abonar(): void {
    this.router.navigate(['/deudas-externas', this.deudaId, 'abonar']);
  }

  async eliminarAbono(abono: AbonoDeuda): Promise<void> {
    const confirmado = await this.notificationService.confirm(
      `Se eliminará el abono de ${new ClpPipe().transform(abono.monto)} y se restaurará el saldo de la deuda.`,
      '¿Eliminar abono?'
    );

    if (confirmado) {
      this.deudaService.eliminarAbono(this.deudaId, abono.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.notificationService.success('Abono eliminado');
          this.cargarDeuda();
          this.cargarAbonos();
        },
        error: () => {
          this.notificationService.error('Error al eliminar el abono');
        }
      });
    }
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'primary';
      case 'PAGADA': return 'accent';
      case 'VENCIDA': return 'warn';
      default: return '';
    }
  }

  getIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'TARJETA_CREDITO': return 'credit_card';
      case 'PRESTAMO_PERSONAL': return 'account_balance';
      case 'PRESTAMO_HIPOTECARIO': return 'home';
      case 'PRESTAMO_VEHICULAR': return 'directions_car';
      case 'DEUDA_FAMILIAR': return 'family_restroom';
      case 'DEUDA_AMIGO': return 'person';
      case 'SERVICIO': return 'receipt';
      default: return 'payments';
    }
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
