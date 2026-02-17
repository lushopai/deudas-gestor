import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  DeudaService,
  Deuda,
  AbonoDeudaCreate,
  MetodoPago,
  METODO_PAGO_LABELS
} from '../../../core/services/deuda.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClpPipe } from '../../../shared/pipes/clp.pipe';

@Component({
  selector: 'app-abono-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    ClpPipe
  ],
  templateUrl: './abono-form.html',
  styleUrl: './abono-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbonoForm implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  formulario: FormGroup;
  deuda: Deuda | null = null;
  cargando = true;
  guardando = false;
  deudaId!: number;

  metodosPago: { value: MetodoPago; label: string }[] = Object.entries(METODO_PAGO_LABELS).map(
    ([value, label]) => ({ value: value as MetodoPago, label })
  );

  constructor(
    private fb: FormBuilder,
    private deudaService: DeudaService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.formulario = this.fb.group({
      monto: ['', [Validators.required, Validators.min(1)]],
      fechaPago: [new Date()],
      metodoPago: ['TRANSFERENCIA'],
      comprobante: ['', [Validators.maxLength(100)]],
      notas: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.deudaId = +id;
      this.cargarDeuda();
    }
  }

  cargarDeuda(): void {
    this.cargando = true;
    this.deudaService.obtenerDeuda(this.deudaId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (deuda) => {
        this.deuda = deuda;

        // Establecer validador máximo basado en saldo pendiente
        this.formulario.get('monto')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(deuda.saldoPendiente)
        ]);
        this.formulario.get('monto')?.updateValueAndValidity();

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Deuda no encontrada');
        this.router.navigate(['/deudas-externas']);
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const datos: AbonoDeudaCreate = {
      ...this.formulario.value,
      fechaPago: this.formatDate(this.formulario.value.fechaPago)
    };

    this.deudaService.registrarAbono(this.deudaId, datos).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.guardando = false;
        this.notificationService.success('Abono registrado exitosamente');
        this.router.navigate(['/deudas-externas', this.deudaId]);
      },
      error: (err) => {
        this.guardando = false;
        const mensaje = err.error?.mensaje || 'Error al registrar el abono';
        this.notificationService.error(mensaje);
        this.cdr.detectChanges();
      }
    });
  }

  pagarTodo(): void {
    if (this.deuda) {
      this.formulario.patchValue({ monto: this.deuda.saldoPendiente });
    }
  }

  cancelar(): void {
    this.router.navigate(['/deudas-externas', this.deudaId]);
  }

  private formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  }

  tieneError(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
