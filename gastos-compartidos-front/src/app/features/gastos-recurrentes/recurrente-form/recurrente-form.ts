import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  GastoRecurrenteService,
  GastoRecurrenteCreate,
  Frecuencia,
  FRECUENCIA_LABELS
} from '../../../core/services/gasto-recurrente.service';
import { GastoService, Categoria } from '../../../core/services/gasto.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-recurrente-form',
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
    MatCheckboxModule
  ],
  templateUrl: './recurrente-form.html',
  styleUrl: './recurrente-form.scss'
})
export class RecurrenteForm implements OnInit {
  formulario: FormGroup;
  categorias: Categoria[] = [];
  cargando = false;
  guardando = false;
  modoEdicion = false;
  gastoId: number | null = null;

  frecuencias: { value: Frecuencia; label: string }[] = Object.entries(FRECUENCIA_LABELS).map(
    ([value, label]) => ({ value: value as Frecuencia, label })
  );

  constructor(
    private fb: FormBuilder,
    private gastoRecurrenteService: GastoRecurrenteService,
    private gastoService: GastoService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.formulario = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      monto: ['', [Validators.required, Validators.min(1)]],
      categoriaId: ['', [Validators.required]],
      frecuencia: ['MENSUAL', [Validators.required]],
      diaEjecucion: [1, [Validators.min(1), Validators.max(31)]],
      fechaInicio: [new Date()],
      fechaFin: [null],
      esCompartido: [false],
      notas: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.modoEdicion = true;
      this.gastoId = +id;
      this.cargarGasto();
    }
  }

  cargarCategorias(): void {
    this.gastoService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter(c => c.activo);
        this.cdr.detectChanges();
      }
    });
  }

  cargarGasto(): void {
    if (!this.gastoId) return;

    this.cargando = true;
    this.gastoRecurrenteService.obtener(this.gastoId).subscribe({
      next: (gasto) => {
        this.formulario.patchValue({
          descripcion: gasto.descripcion,
          monto: gasto.monto,
          categoriaId: gasto.categoriaId,
          frecuencia: gasto.frecuencia,
          diaEjecucion: gasto.diaEjecucion,
          fechaInicio: gasto.fechaInicio ? new Date(gasto.fechaInicio) : null,
          fechaFin: gasto.fechaFin ? new Date(gasto.fechaFin) : null,
          esCompartido: gasto.esCompartido,
          notas: gasto.notas
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Error al cargar el gasto recurrente');
        this.router.navigate(['/gastos-recurrentes']);
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const valores = this.formulario.value;
    const datos: GastoRecurrenteCreate = {
      descripcion: valores.descripcion,
      monto: valores.monto,
      categoriaId: valores.categoriaId,
      frecuencia: valores.frecuencia,
      diaEjecucion: valores.diaEjecucion,
      fechaInicio: this.formatDate(valores.fechaInicio),
      fechaFin: this.formatDate(valores.fechaFin),
      esCompartido: valores.esCompartido,
      notas: valores.notas || undefined
    };

    const operacion = this.modoEdicion && this.gastoId
      ? this.gastoRecurrenteService.actualizar(this.gastoId, datos)
      : this.gastoRecurrenteService.crear(datos);

    operacion.subscribe({
      next: () => {
        this.guardando = false;
        this.notificationService.success(
          this.modoEdicion ? 'Gasto recurrente actualizado' : 'Gasto recurrente creado exitosamente'
        );
        this.router.navigate(['/gastos-recurrentes']);
      },
      error: (err) => {
        this.guardando = false;
        const mensaje = err.error?.mensaje || 'Error al guardar';
        this.notificationService.error(mensaje);
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/gastos-recurrentes']);
  }

  private formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  }

  tieneError(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  get necesitaDia(): boolean {
    const freq = this.formulario.get('frecuencia')?.value;
    return freq && freq !== 'DIARIA' && freq !== 'SEMANAL';
  }
}
