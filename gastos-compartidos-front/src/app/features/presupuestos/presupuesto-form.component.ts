import { Component, Inject, OnInit } from '@angular/core';
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
    <h2 mat-dialog-title>{{ data.presupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="presupuesto-form">
        
        <!-- Categoría -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="categoriaId">
            <mat-option [value]="null">
              <mat-icon>account_balance_wallet</mat-icon>
              Total General (Global)
            </mat-option>
            <mat-divider></mat-divider>
            @for (cat of categorias; track cat.id) {
              <mat-option [value]="cat.id">
                <mat-icon>{{ cat.icono }}</mat-icon>
                {{ cat.nombre }}
              </mat-option>
            }
          </mat-select>
          <mat-hint>Elige una categoría específica o crea un límite global</mat-hint>
        </mat-form-field>

        <!-- Límite y Período -->
        <div class="row">
          <mat-form-field appearance="outline" class="col">
            <mat-label>Límite ($)</mat-label>
            <input matInput type="number" formControlName="limite" min="0">
            <mat-error *ngIf="form.get('limite')?.hasError('required')">Requerido</mat-error>
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

        <!-- Notas -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notas (Opcional)</mat-label>
          <textarea matInput formControlName="notas" rows="2"></textarea>
        </mat-form-field>

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
    .presupuesto-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 8px;
      min-width: 300px;
    }
    .full-width {
      width: 100%;
    }
    .row {
      display: flex;
      gap: 16px;
    }
    .col {
      flex: 1;
    }
    mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }
    @media (max-width: 600px) {
      .row { flex-direction: column; gap: 0; }
    }
  `]
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
