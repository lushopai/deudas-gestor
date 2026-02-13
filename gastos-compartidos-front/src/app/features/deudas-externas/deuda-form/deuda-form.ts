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
  DeudaCreate,
  TipoDeuda,
  TIPO_DEUDA_LABELS
} from '../../../core/services/deuda.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-deuda-form',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './deuda-form.html',
  styleUrl: './deuda-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeudaForm implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  formulario: FormGroup;
  cargando = false;
  guardando = false;
  modoEdicion = false;
  deudaId: number | null = null;

  tiposDeuda: { value: TipoDeuda; label: string }[] = Object.entries(TIPO_DEUDA_LABELS).map(
    ([value, label]) => ({ value: value as TipoDeuda, label })
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
      acreedor: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      tipo: ['TARJETA_CREDITO', [Validators.required]],
      montoOriginal: ['', [Validators.required, Validators.min(1)]],
      fechaInicio: [new Date()],
      fechaVencimiento: [null],
      diaCorte: [null, [Validators.min(1), Validators.max(31)]],
      diaLimitePago: [null, [Validators.min(1), Validators.max(31)]],
      tasaInteres: [null, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      this.modoEdicion = true;
      this.deudaId = +id;
      this.cargarDeuda();
    }
  }

  cargarDeuda(): void {
    if (!this.deudaId) return;

    this.cargando = true;
    this.deudaService.obtenerDeuda(this.deudaId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (deuda) => {
        this.formulario.patchValue({
          acreedor: deuda.acreedor,
          descripcion: deuda.descripcion,
          tipo: deuda.tipo,
          montoOriginal: deuda.montoOriginal,
          fechaInicio: deuda.fechaInicio ? new Date(deuda.fechaInicio) : null,
          fechaVencimiento: deuda.fechaVencimiento ? new Date(deuda.fechaVencimiento) : null,
          diaCorte: deuda.diaCorte,
          diaLimitePago: deuda.diaLimitePago,
          tasaInteres: deuda.tasaInteres
        });

        // Si tiene abonos, deshabilitar monto original
        if (deuda.totalAbonos > 0) {
          this.formulario.get('montoOriginal')?.disable();
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Error al cargar la deuda');
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
    const datos: DeudaCreate = {
      ...this.formulario.getRawValue(),
      fechaInicio: this.formatDate(this.formulario.value.fechaInicio),
      fechaVencimiento: this.formatDate(this.formulario.value.fechaVencimiento)
    };

    const operacion = this.modoEdicion && this.deudaId
      ? this.deudaService.actualizarDeuda(this.deudaId, datos)
      : this.deudaService.crearDeuda(datos);

    operacion.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.guardando = false;
        this.notificationService.success(
          this.modoEdicion ? 'Deuda actualizada' : 'Deuda creada exitosamente'
        );
        this.router.navigate(['/deudas-externas']);
      },
      error: (err) => {
        this.guardando = false;
        const mensaje = err.error?.mensaje || 'Error al guardar la deuda';
        this.notificationService.error(mensaje);
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/deudas-externas']);
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
