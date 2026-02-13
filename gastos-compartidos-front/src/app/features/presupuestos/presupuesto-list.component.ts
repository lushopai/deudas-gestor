import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PresupuestoService, Presupuesto } from '../../core/services/presupuesto.service';
import { PresupuestoFormComponent } from './presupuesto-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-presupuesto-list',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatMenuModule,
        MatProgressBarModule,
        MatDividerModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    template: `
    <div class="presupuestos-container">
      <div class="header">
        <h1>Presupuestos</h1>
        <button mat-raised-button color="primary" (click)="abrirDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Presupuesto
        </button>
      </div>

      <div class="category-summary" *ngIf="presupuestos.length > 0">
        <div class="summary-item">
          <span class="summary-value">{{ countActivos }}</span>
          <span class="summary-label">Activos</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ countExcedidos }}</span>
          <span class="summary-label">Excedidos</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ countAlert }}</span>
          <span class="summary-label">Alerta</span>
        </div>
      </div>

      <div class="presupuestos-grid">
        <mat-card *ngFor="let p of presupuestos" class="presupuesto-card" [class.inactive]="!p.activo">
          <div class="card-header">
            <div class="header-icon" [class.active-icon]="p.activo">
              <mat-icon>{{ p.categoriaIcono || 'account_balance_wallet' }}</mat-icon>
            </div>
            <div class="header-info">
              <span class="title">{{ p.categoriaNombre || 'Total General' }}</span>
              <span class="period" [ngClass]="p.periodo">{{ p.periodo }}</span>
            </div>
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="toggleActivo(p)">
                <mat-icon>{{ p.activo ? 'toggle_off' : 'toggle_on' }}</mat-icon>
                <span>{{ p.activo ? 'Desactivar' : 'Activar' }}</span>
              </button>
              <button mat-menu-item (click)="abrirDialog(p)">
                <mat-icon>edit</mat-icon>
                <span>Editar</span>
              </button>
              <button mat-menu-item (click)="eliminar(p)" class="delete-item">
                <mat-icon color="warn">delete</mat-icon>
                <span class="text-warn">Eliminar</span>
              </button>
            </mat-menu>
          </div>

          <div class="card-content">
            <div class="amount-row">
              <span class="spent">{{ p.gastado | currency }}</span>
              <span class="separator">/</span>
              <span class="limit">{{ p.limite | currency }}</span>
            </div>
            
            <mat-progress-bar 
              mode="determinate" 
              [value]="p.porcentajeUsado > 100 ? 100 : p.porcentajeUsado"
              [color]="getColor(p)"
              class="budget-progress">
            </mat-progress-bar>

            <div class="status-row">
              <span class="percentage">{{ p.porcentajeUsado | number:'1.0-0' }}%</span>
              <span class="remaining" [class.negative]="p.disponible < 0">
                {{ p.disponible >= 0 ? 'Quedan: ' : 'Excedido: ' }}
                {{ (p.disponible >= 0 ? p.disponible : -p.disponible) | currency }}
              </span>
            </div>
            
            <div class="notes" *ngIf="p.notas">
              <mat-icon>notes</mat-icon> {{ p.notas }}
            </div>
          </div>
        </mat-card>

        <div *ngIf="presupuestos.length === 0 && !loading" class="empty-state">
          <mat-icon>savings</mat-icon>
          <h3>No tienes presupuestos activos</h3>
          <p>Crea un presupuesto para controlar tus gastos por categoría.</p>
          <button mat-stroked-button (click)="abrirDialog()">Crear Primero</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .presupuestos-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    h1 { margin: 0; font-size: 24px; font-weight: 600; }
    
    .category-summary {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .summary-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .summary-value { font-size: 24px; font-weight: 700; color: #333; }
    .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }

    .presupuestos-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .presupuesto-card {
      border-radius: 12px;
      padding: 16px;
      transition: all 0.2s;
    }
    .presupuesto-card.inactive {
      opacity: 0.6;
      background: #f9f9f9;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .header-icon {
      background: #eef2ff;
      border-radius: 50%;
      padding: 8px;
      color: #6366f1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-icon.active-icon {
      background: #e0e7ff;
      color: #4f46e5;
    }
    .header-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .title { font-weight: 600; font-size: 16px; }
    .period { font-size: 12px; color: #666; }
    
    .amount-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 8px;
    }
    .spent { font-size: 20px; font-weight: 700; }
    .separator { color: #999; }
    .limit { font-size: 14px; color: #666; }

    .budget-progress {
      height: 8px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    
    .status-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
    }
    .remaining.negative { color: #ef4444; font-weight: 600; }
    
    .notes {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .notes mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .delete-item { color: #ef4444; }
    .text-warn { color: #ef4444; }

    .empty-state {
      text-align: center;
      padding: 48px 0;
      color: #999;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    @media (max-width: 600px) {
      .presupuestos-container { padding: 16px; }
      .header h1 { font-size: 20px; }
    }
  `]
})
export class PresupuestoListComponent implements OnInit {
    presupuestos: Presupuesto[] = [];
    loading = true;

    get countActivos() { return this.presupuestos.filter(p => p.activo).length; }
    get countExcedidos() { return this.presupuestos.filter(p => p.activo && p.estado === 'EXCEDIDO').length; }
    get countAlert() { return this.presupuestos.filter(p => p.activo && p.estado === 'ALERTA').length; }

    constructor(
        private presupuestoService: PresupuestoService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.cargarPresupuestos();
    }

    cargarPresupuestos() {
        this.loading = true;
        this.presupuestoService.listar().subscribe({
            next: (data) => {
                this.presupuestos = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al cargar presupuestos', 'Cerrar', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    abrirDialog(presupuesto?: Presupuesto) {
        const dialogRef = this.dialog.open(PresupuestoFormComponent, {
            width: '400px',
            data: { presupuesto }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (presupuesto) {
                    this.presupuestoService.actualizar(presupuesto.id, result).subscribe(() => {
                        this.snackBar.open('Presupuesto actualizado', 'OK', { duration: 3000 });
                        this.cargarPresupuestos();
                    });
                } else {
                    this.presupuestoService.crear(result).subscribe(() => {
                        this.snackBar.open('Presupuesto creado', 'OK', { duration: 3000 });
                        this.cargarPresupuestos();
                    });
                }
            }
        });
    }

    toggleActivo(p: Presupuesto) {
        this.presupuestoService.toggleActivo(p.id).subscribe(() => {
            p.activo = !p.activo;
            this.snackBar.open(`Presupuesto ${p.activo ? 'activado' : 'desactivado'}`, 'OK', { duration: 2000 });
        });
    }

    eliminar(p: Presupuesto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Eliminar Presupuesto',
                message: `¿Estás seguro de eliminar el presupuesto de ${p.categoriaNombre}?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.presupuestoService.eliminar(p.id).subscribe(() => {
                    this.snackBar.open('Presupuesto eliminado', 'OK', { duration: 3000 });
                    this.cargarPresupuestos();
                });
            }
        });
    }

    getColor(p: Presupuesto): string {
        if (p.estado === 'EXCEDIDO') return 'warn';
        if (p.estado === 'ALERTA') return 'accent';
        return 'primary';
    }
}
