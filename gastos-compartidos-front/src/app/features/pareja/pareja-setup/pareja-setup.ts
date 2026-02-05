import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ParejaService, Pareja } from '../../../core/services/pareja.service';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-pareja-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ClipboardModule
  ],
  templateUrl: './pareja-setup.html',
  styleUrl: './pareja-setup.scss',
})
export class ParejaSetup implements OnInit {
  formularioUnirse!: FormGroup;
  codigoInvitacion: string | null = null;
  pareja: Pareja | null = null;
  cargando = false;
  cargandoCodigo = true;

  constructor(
    private fb: FormBuilder,
    private parejaService: ParejaService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.formularioUnirse = this.fb.group({
      codigoInvitacion: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.cargarMiPareja();
  }

  cargarMiPareja(): void {
    this.cargandoCodigo = true;

    this.parejaService.obtenerMiPareja().subscribe({
      next: (pareja) => {
        this.pareja = pareja;
        this.cargandoCodigo = false;
      },
      error: () => {
        // Si no tiene pareja, cargar el código de invitación
        this.cargarCodigoInvitacion();
      }
    });
  }

  cargarCodigoInvitacion(): void {
    this.parejaService.obtenerCodigoInvitacion().subscribe({
      next: (codigo) => {
        this.codigoInvitacion = codigo;
        this.cargandoCodigo = false;
      },
      error: (err) => {
        console.error('Error al obtener código:', err);
        this.cargandoCodigo = false;
      }
    });
  }

  copiarCodigo(): void {
    this.notificationService.toast('Código copiado al portapapeles', 'success');
  }

  unirseAPareja(): void {
    if (this.formularioUnirse.invalid) return;

    this.cargando = true;
    this.loadingService.show('Uniéndose a la pareja...');
    const codigo = this.formularioUnirse.value.codigoInvitacion;

    this.parejaService.unirseAPareja(codigo).subscribe({
      next: (pareja) => {
        this.loadingService.hide();
        this.notificationService.success('Te has unido exitosamente a la pareja');
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loadingService.hide();
        this.cargando = false;
        // El error se maneja automáticamente en el interceptor
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  irADashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
