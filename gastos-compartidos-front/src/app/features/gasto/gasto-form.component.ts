import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Router, ActivatedRoute } from '@angular/router';
import { OcrService } from '../../core/services/ocr.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-gasto-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    MatToolbarModule,
    MatDividerModule
  ],
  templateUrl: './gasto-form.component.html',
  styleUrls: ['./gasto-form.component.scss']
})
export class GastoFormComponent implements OnInit {
  formulario: FormGroup;
  categorias: any[] = [];
  cargando = false;
  procesandoOcr = false;
  resultadoOcr: any = null;
  selectedTabIndex = 0; // 0 = Manual, 1 = OCR

  // Modo edición
  modoEdicion = false;
  gastoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private ocrService: OcrService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef
  ) {
    this.formulario = this.fb.group({
      descripcion: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0)]],
      categoriaId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();

    // Detectar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.gastoId = +params['id'];
        this.modoEdicion = true;
        this.cargarGasto(this.gastoId);
      }
    });

    // Si la ruta es /gastos/ocr, abrir la tab de escanear
    if (this.router.url.includes('/gastos/ocr')) {
      this.selectedTabIndex = 1;
    }
  }

  cargarCategorias(): void {
    this.apiService.getCategorias().subscribe({
      next: (response) => {
        this.categorias = response.value || response;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar categorias:', err);
        this.alertService.error(
          'No se pudieron cargar las categorías',
          'Error de conexión',
          err.message || 'Verifica tu conexión a internet'
        );
      }
    });
  }

  cargarGasto(id: number): void {
    this.cargando = true;
    this.apiService.getGasto(id).subscribe({
      next: (gasto) => {
        this.formulario.patchValue({
          descripcion: gasto.descripcion,
          monto: gasto.monto,
          categoriaId: gasto.categoriaId
        });
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar gasto:', err);
        this.alertService.error(
          'No se pudo cargar el gasto',
          'Error',
          err.message || 'El gasto no existe o no tienes permiso para verlo'
        ).then(() => {
          this.router.navigate(['/gastos']);
        });
        this.cargando = false;
      }
    });
  }

  getCategoria(id: any) {
    return this.categorias.find(c => c.id === id);
  }

  guardarGasto(): void {
    if (this.formulario.invalid) {
      this.alertService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const usuario = this.authService.obtenerUsuario();
    if (!usuario || !usuario.id) {
      this.alertService.error('No se pudo identificar al usuario', 'Error de sesión');
      return;
    }

    const gastoPayload = {
      ...this.formulario.value,
      fechaGasto: new Date().toISOString(),
      split: {
        [usuario.id]: this.formulario.value.monto
      }
    };

    this.cargando = true;

    // Determinar si crear o actualizar
    const operacion = this.modoEdicion && this.gastoId
      ? this.apiService.actualizarGasto(this.gastoId, gastoPayload)
      : this.apiService.crearGasto(gastoPayload);

    const mensajeExito = this.modoEdicion ? 'El gasto se actualizó correctamente' : 'El gasto se guardó correctamente';

    operacion.subscribe({
      next: () => {
        this.alertService.success(mensajeExito).then(() => {
          this.router.navigate(['/gastos']);
        });
      },
      error: (err) => {
        console.error('Error al guardar gasto:', err);
        this.alertService.error(
          this.modoEdicion ? 'No se pudo actualizar el gasto' : 'No se pudo guardar el gasto',
          'Error',
          err.error?.message || 'Verifica tu conexión e inténtalo nuevamente'
        );
        this.cargando = false;
      }
    });
  }

  itemsDetalle: any[] = [];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.procesandoOcr = true;
      this.resultadoOcr = null;
      this.itemsDetalle = [];

      this.ocrService.procesarRecibo(file).then(resultado => {
        this.resultadoOcr = resultado;

        if (resultado.datos) {
          this.formulario.patchValue({
            descripcion: resultado.datos.descripcion || '',
            monto: resultado.datos.cantidad || ''
          });

          // Cargar items si existen
          if (resultado.datos.items && Array.isArray(resultado.datos.items)) {
            this.itemsDetalle = resultado.datos.items;
          }
        }
        this.procesandoOcr = false;
        this.cdRef.detectChanges();
      }).catch(err => {
        console.error('Error en OCR:', err);
        this.alertService.error(
          'No se pudo procesar la imagen',
          'Error de OCR',
          'Intenta con otra imagen más clara'
        );
        this.procesandoOcr = false;
        this.cdRef.detectChanges();
      });
    }
  }

  eliminarItem(index: number): void {
    if (index >= 0 && index < this.itemsDetalle.length) {
      this.itemsDetalle.splice(index, 1);
      this.recalcularTotal();
    }
  }

  recalcularTotal(): void {
    const nuevoTotal = this.itemsDetalle.reduce((sum, item) => sum + (Number(item.precio) || 0), 0);
    this.formulario.patchValue({
      monto: nuevoTotal
    });

    // Actualizar también en la vista del resultado OCR para consistencia visual
    if (this.resultadoOcr && this.resultadoOcr.datos) {
      this.resultadoOcr.datos.cantidad = nuevoTotal;
    }
  }

  limpiarOCR(): void {
    this.resultadoOcr = null;
    this.formulario.reset();
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
