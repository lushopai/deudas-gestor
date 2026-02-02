import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule
    ],
    template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="volver()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>Reportes</span>
    </mat-toolbar>

    <div class="reportes-container">
      <mat-card class="info-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>construction</mat-icon>
            Próximamente
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>La sección de reportes estará disponible próximamente.</p>
          <p>Aquí podrás ver:</p>
          <ul>
            <li>Gráficos de gastos por categoría</li>
            <li>Tendencias mensuales</li>
            <li>Comparativas de períodos</li>
            <li>Exportación de datos</li>
          </ul>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="volver()">
            Volver al Dashboard
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
    styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #fafafa;
    }

    mat-toolbar {
      flex-shrink: 0;
      background: #1976d2;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      button {
        color: white;
      }

      span {
        font-weight: 500;
        font-size: 20px;
        flex: 1;
        margin-left: 16px;
      }
    }

    .reportes-container {
      flex: 1;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .info-card {
      max-width: 600px;
      width: 100%;

      mat-card-header {
        margin-bottom: 16px;
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        color: rgba(0, 0, 0, 0.87);

        mat-icon {
          color: #1976d2;
        }
      }

      ul {
        margin: 16px 0;
        padding-left: 24px;
        color: rgba(0, 0, 0, 0.6);
      }

      li {
        margin: 8px 0;
      }
    }
  `]
})
export class ReportesComponent implements OnInit {
    constructor(private router: Router) { }

    ngOnInit(): void { }

    volver(): void {
        this.router.navigate(['/dashboard']);
    }
}
