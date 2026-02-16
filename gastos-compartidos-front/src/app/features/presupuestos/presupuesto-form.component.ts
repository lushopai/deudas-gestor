import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../core/services/api.service';
import { Presupuesto, PresupuestoCreate } from '../../core/services/presupuesto.service';

export interface PresupuestoFormData {
    presupuesto?: Presupuesto;
}

@Component({
    selector: 'app-presupuesto-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatDividerModule,
        MatSlideToggleModule
    ],
    template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>{{ data.presupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto' }}</h2>
      <p class="dialog-subtitle">{{ data.presupuesto ? 'Actualiza tu límite de gasto' : 'Establece un límite para controlar tus gastos' }}</p>
    </div>
    <mat-dialog-content>
      <form [formGroup]="form" class="presupuesto-form">
        
        <!-- Categoría con descripción -->
        <div class="form-section">
          <label class="section-label">
            <mat-icon>category</mat-icon>
            Categoría
          </label>
          <p class="section-hint">Elige una categoría específica o crea un límite global</p>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Selecciona una opción</mat-label>
            <mat-select formControlName="categoriaId">
              <mat-optgroup label="GENERAL">
                <mat-option [value]="null" class="global-option">
                  <mat-icon>account_balance_wallet</mat-icon>
                  <span>Global - Todas las categorías</span>
                </mat-option>
              </mat-optgroup>
              <mat-optgroup label="POR CATEGORÍA" *ngIf="categorias.length > 0">
                @for (cat of categorias; track cat.id) {
                  <mat-option [value]="cat.id" class="category-option">
                    <span class="cat-icon">{{ cat.icono }}</span>
                    <span>{{ cat.nombre }}</span>
                  </mat-option>
                }
              </mat-optgroup>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Límite y Período -->
        <div class="form-section">
          <label class="section-label">
            <mat-icon>trending_up</mat-icon>
            Límite de Gasto
          </label>
          <p class="section-hint">Define cuánto quieres gastar en este período</p>
          
          <div class="row">
            <mat-form-field appearance="outline" class="col">
              <mat-label>$ Monto Máximo</mat-label>
              <input matInput type="number" formControlName="limite" min="0" placeholder="0.00">
              <mat-error *ngIf="form.get('limite')?.hasError('required')">Campo requerido</mat-error>
              <mat-error *ngIf="form.get('limite')?.hasError('min')">Debe ser mayor a 0</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="col">
              <mat-label>Período</mat-label>
              <mat-select formControlName="periodo">
                <mat-option value="SEMANAL">Semanal</mat-option>
                <mat-option value="MENSUAL">Mensual</mat-option>
                <mat-option value="ANUAL">Anual</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <!-- Notas -->
        <div class="form-section">
          <label class="section-label">
            <mat-icon>notes</mat-icon>
            Notas (Opcional)
          </label>
          <p class="section-hint">Añade un recordatorio o descripción</p>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Escribe aquí...</mat-label>
            <textarea matInput formControlName="notas" rows="2" placeholder="Ej: Presupuesto para entretenimiento"></textarea>
          </mat-form-field>
        </div>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" 
              [disabled]="form.invalid || loading" 
              (click)="guardar()">
        {{ data.presupuesto ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `, 
    styles: [`
    .dialog-header {
      margin-bottom: 16px;
    }
    .dialog-header h2 {
      margin: 0 0 4px 0;
      font-size: 20px;
    }
    .dialog-subtitle {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    .presupuesto-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding-top: 8px;
      min-width: 340px;
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
      color: #333;
      margin: 0;
    }
    .section-label mat-icon {
      color: #1976d2;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .section-hint {
      margin: 0;
      font-size: 12px;
      color: #999;
    }
    
    .full-width {
      width: 100%;
    }
    
    .global-option, .category-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cat-icon {
      display: inline-block;
      min-width: 20px;
    }
    
    .row {
      display: flex;
      gap: 16px;
    }
    .col {
      flex: 1;
    }
    
    @media (max-width: 600px) {
      .presupuesto-form {
        min-width: 280px;
      }
      .row { 
        flex-direction: column; 
        gap: 0; 
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresupuestoFormComponent implements OnInit {
    form: FormGroup;
    categorias: any[] = [];
    loading = false;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        public dialogRef: MatDialogRef<PresupuestoFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PresupuestoFormData
    ) {
        this.form = this.fb.group({
            categoriaId: [data.presupuesto?.categoriaId || null],
            limite: [data.presupuesto?.limite || '', [Validators.required, Validators.min(1)]],
            periodo: [data.presupuesto?.periodo || 'MENSUAL', Validators.required],
            notas: [data.presupuesto?.notas || '']
        });
    }

    ngOnInit(): void {
        this.loadCategorias();
    }

    loadCategorias() {
        this.apiService.getCategorias().subscribe(cats => {
            this.categorias = cats;
        });
    }

    guardar() {
        if (this.form.valid) {
            const value = this.form.value;
            const payload: PresupuestoCreate = {
                categoriaId: value.categoriaId,
                limite: value.limite,
                periodo: value.periodo,
                notas: value.notas
            };
            this.dialogRef.close(payload);
        }
    }
}
