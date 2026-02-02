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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { OcrService } from '../../core/services/ocr.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

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
    MatSnackBarModule,
    MatToolbarModule,
    MatDividerModule
  ],
  template: `
    <!-- Header -->
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="volver()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>Registrar Gasto</span>
    </mat-toolbar>

    <div class="form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Nuevo Gasto</mat-card-title>
          <mat-card-subtitle>Ingresa un gasto manualmente o escanea un recibo</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group class="tabs-container">
            <!-- Pestaña: Ingreso Manual -->
            <mat-tab label="📝 Ingreso Manual">
              <div class="tab-content">
                <form [formGroup]="formulario" (ngSubmit)="guardarGasto()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Descripción</mat-label>
                    <input matInput formControlName="descripcion" placeholder="Ej: Almuerzo, Supermercado..." required>
                    <mat-icon matPrefix>description</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Monto</mat-label>
                    <input matInput type="number" step="0.01" formControlName="monto" placeholder="0.00" required>
                    <mat-icon matPrefix>attach_money</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Categoría</mat-label>
                    <mat-select formControlName="categoriaId" required>
                      <mat-select-trigger *ngIf="getCategoria(formulario.get('categoriaId')?.value) as cat">
                        {{ cat?.icono }} {{ cat?.nombre }}
                      </mat-select-trigger>
                      <mat-option *ngFor="let cat of categorias" [value]="cat.id">
                        {{ cat.icono }} {{ cat.nombre }}
                      </mat-option>
                    </mat-select>
                    <mat-icon matPrefix>category</mat-icon>
                  </mat-form-field>

                  <button mat-raised-button color="primary" type="submit" class="full-width submit-btn" [disabled]="cargando">
                    <mat-icon *ngIf="!cargando">save</mat-icon>
                    <mat-progress-spinner *ngIf="cargando" diameter="24" mode="indeterminate"></mat-progress-spinner>
                    {{ cargando ? 'Guardando...' : 'Guardar Gasto' }}
                  </button>
                </form>
              </div>
            </mat-tab>

            <!-- Pestaña: Escanear Recibo -->
            <mat-tab label="📸 Escanear Recibo">
              <div class="tab-content">
                <div class="ocr-container">
                  <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)">
                  
                  <button 
                    mat-raised-button 
                    color="accent" 
                    (click)="fileInput.click()" 
                    [disabled]="procesandoOcr"
                    class="upload-button"
                  >
                    <mat-icon *ngIf="!procesandoOcr">cloud_upload</mat-icon>
                    <mat-progress-spinner 
                      *ngIf="procesandoOcr" 
                      diameter="24" 
                      mode="indeterminate"
                    ></mat-progress-spinner>
                    {{ procesandoOcr ? 'Procesando...' : 'Seleccionar Imagen' }}
                  </button>

                  <!-- Resultado del OCR -->
                  <div *ngIf="resultadoOcr" class="ocr-result">
                    <h3 class="result-title">✓ Datos Extraídos del Recibo</h3>
                    <div class="resultado-items">
                      <div class="resultado-item">
                        <strong>Monto detectado:</strong>
                        <span class="monto">\${{ resultadoOcr.datos?.cantidad || 'N/A' }}</span>
                      </div>
                      <div class="resultado-item">
                        <strong>Descripción:</strong>
                        <span>{{ resultadoOcr.datos?.descripcion || 'No especificada' }}</span>
                      </div>
                      <div class="resultado-item">
                        <strong>Confianza:</strong>
                        <span 
                          class="confianza"
                          [class.alta]="resultadoOcr.confianza > 70"
                          [class.media]="resultadoOcr.confianza > 40 && resultadoOcr.confianza <= 70"
                          [class.baja]="resultadoOcr.confianza <= 40"
                        >
                          {{ resultadoOcr.confianza }}%
                        </span>
                      </div>
                    </div>

                    <mat-divider class="result-divider"></mat-divider>

                    <h4 class="edit-title">Edita los datos antes de guardar:</h4>
                    <form [formGroup]="formulario" (ngSubmit)="guardarGasto()">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Descripción</mat-label>
                        <input matInput formControlName="descripcion" required>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Monto</mat-label>
                        <input matInput type="number" step="0.01" formControlName="monto" required>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Categoría</mat-label>
                        <mat-select formControlName="categoriaId" required>
                          <mat-option *ngFor="let cat of categorias" [value]="cat.id">
                            {{ cat.icono }} {{ cat.nombre }}
                          </mat-option>
                        </mat-select>
                      </mat-form-field>

                      <div class="button-group">
                        <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="cargando">
                          <mat-icon *ngIf="!cargando">save</mat-icon>
                          <mat-progress-spinner *ngIf="cargando" diameter="24" mode="indeterminate"></mat-progress-spinner>
                          {{ cargando ? 'Guardando...' : 'Guardar Gasto' }}
                        </button>
                        <button mat-stroked-button (click)="limpiarOCR()" type="button">
                          <mat-icon>close</mat-icon>
                          Limpiar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f8f9fa;
    }

    mat-toolbar {
      flex-shrink: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      button {
        color: white;
      }

      span {
        font-weight: 600;
        font-size: 18px;
        flex: 1;
        margin-left: 16px;
      }
    }

    .form-container {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding: 16px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .form-card {
      width: 100%;
      max-width: 100%;
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border-radius: 12px;
      margin: 16px 0;
    }

    mat-card-header {
      padding: 20px !important;
    }

    mat-card-title {
      font-size: 22px !important;
      font-weight: 600 !important;
      margin: 0 !important;
      color: #1a1a1a;
    }

    mat-card-subtitle {
      color: #999 !important;
      margin-top: 4px !important;
      font-size: 13px !important;
    }

    mat-card-content {
      padding: 0 !important;
    }

    .tab-content {
      padding: 20px;
    }

    .tabs-container {
      ::ng-deep {
        .mdc-tab {
          padding: 0 16px !important;
          font-size: 13px;
        }

        .mdc-tab-indicator {
          background-color: #667eea;
        }

        .mdc-tab__content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0;
        }
      }
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-form-field {
      ::ng-deep {
        .mdc-text-field {
          background-color: #f8f9fa;
        }
      }
    }

    .submit-btn {
      padding: 0 !important;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      width: 100%;
      margin-top: 32px;
      position: relative;
      z-index: 0;
    }

    .ocr-container {
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .upload-button {
      margin: 0 !important;
      padding: 0 !important;
      min-height: 56px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 15px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
      }
    }

    .ocr-result {
      margin-top: 8px;
      padding: 20px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e8f4f8 100%);
      border-left: 4px solid #4caf50;
      border-radius: 8px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result-title {
      color: #2c3e50;
      margin: 0 0 16px 0;
      font-size: 15px;
      font-weight: 600;
    }

    .resultado-items {
      display: grid;
      gap: 12px;
      margin-bottom: 16px;
    }

    .resultado-item {
      padding: 12px;
      background: white;
      border-radius: 6px;
      border-left: 3px solid #667eea;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      strong {
        color: #555;
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
        font-weight: 600;
      }

      span {
        color: #1a1a1a;
        font-size: 14px;
      }

      .monto {
        font-size: 18px;
        font-weight: 700;
        color: #27ae60;
      }

      .confianza {
        font-weight: 700;
        font-size: 14px;

        &.alta {
          color: #27ae60;
        }

        &.media {
          color: #f39c12;
        }

        &.baja {
          color: #e74c3c;
        }
      }
    }

    .result-divider {
      margin: 16px 0 !important;
    }

    .edit-title {
      color: #34495e;
      margin: 16px 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 16px;

      button {
        flex: 1;
        height: 44px;
        font-weight: 600;
      }
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .form-container {
        padding: 0;
      }

      .form-card {
        border-radius: 0;
        margin: 0;
        box-shadow: none;
        min-height: 100%;
      }

      mat-card-header {
        padding: 16px !important;
      }

      mat-card-title {
        font-size: 20px !important;
      }

      .tab-content {
        padding: 16px;
      }

      .ocr-result {
        margin-top: 0;
        padding: 16px;
      }

      .resultado-items {
        gap: 10px;
      }

      .resultado-item {
        padding: 10px;
      }

      .submit-btn {
        height: 44px;
        margin-top: 12px;
      }

      .button-group {
        gap: 8px;
        margin-top: 12px;

        button {
          height: 40px;
          font-size: 13px;
        }
      }
    }

    /* iOS Safe Area */
    @supports (padding: max(0px)) {
      .form-container {
        padding-left: max(16px, env(safe-area-inset-left));
        padding-right: max(16px, env(safe-area-inset-right));
        padding-bottom: max(16px, env(safe-area-inset-bottom));
      }

      mat-toolbar {
        padding-right: max(0, env(safe-area-inset-right));
        padding-left: max(0, env(safe-area-inset-left));
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      :host {
        background: #1a1a1a;
      }

      .form-card {
        background: #242424;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
      }

      mat-card-title {
        color: #ffffff;
      }

      mat-card-subtitle {
        color: #aaa !important;
      }

      mat-form-field {
        ::ng-deep {
          .mdc-text-field {
            background-color: #333333;
          }
        }
      }

      .ocr-result {
        background: linear-gradient(135deg, #1e3a5f 0%, #1a2634 100%);
      }

      .resultado-item {
        background: #333333;

        strong {
          color: #aaa;
        }

        span {
          color: #fff;
        }
      }

      .result-title,
      .edit-title {
        color: #fff;
      }
    }
    /* Fix for mat-select transparency issue */
    ::ng-deep .mat-mdc-select-panel {
      background-color: white !important;
      border-radius: 4px !important;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3) !important;
    }

    /* Dark Mode overrides for select panel */
    @media (prefers-color-scheme: dark) {
      ::ng-deep .mat-mdc-select-panel {
        background-color: #242424 !important;
        border: 1px solid #333;
      }
      
      ::ng-deep .mat-mdc-option {
         color: #fff !important;
      }
      
      ::ng-deep .mat-mdc-option:hover, ::ng-deep .mat-mdc-option.mdc-list-item--selected {
         background-color: #333 !important;
      }
    }
  `]
})
export class GastoFormComponent implements OnInit {
  formulario: FormGroup;
  categorias: any[] = [];
  cargando = false;
  procesandoOcr = false;
  resultadoOcr: any = null;

  constructor(
    private fb: FormBuilder,
    private ocrService: OcrService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
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
  }

  cargarCategorias(): void {
    this.apiService.getCategorias().subscribe({
      next: (response) => {
        this.categorias = response.value || response;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar categorias:', err);
        this.snackBar.open('Error al cargar categorías', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getCategoria(id: any) {
    return this.categorias.find(c => c.id === id);
  }

  guardarGasto(): void {
    if (this.formulario.invalid) {
      this.snackBar.open('Por favor completa todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }

    const usuario = this.authService.obtenerUsuario();
    if (!usuario || !usuario.id) {
      this.snackBar.open('Error: No se pudo identificar al usuario', 'Cerrar', { duration: 3000 });
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
    this.apiService.crearGasto(gastoPayload).subscribe({
      next: () => {
        this.snackBar.open('✅ Gasto guardado exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error al guardar gasto:', err);
        this.snackBar.open('❌ Error al guardar el gasto', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.procesandoOcr = true;

      this.ocrService.procesarRecibo(file).then(resultado => {
        this.resultadoOcr = resultado;

        if (resultado.datos) {
          this.formulario.patchValue({
            descripcion: resultado.datos.descripcion || '',
            monto: resultado.datos.cantidad || ''
          });
        }
        this.procesandoOcr = false;
      }).catch(err => {
        console.error('Error en OCR:', err);
        this.snackBar.open('❌ Error al procesar la imagen', 'Cerrar', { duration: 3000 });
        this.procesandoOcr = false;
      });
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
