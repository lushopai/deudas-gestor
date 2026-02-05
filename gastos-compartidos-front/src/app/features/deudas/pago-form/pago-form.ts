import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PagoService, MetodoPago, ResumenDeuda } from '../../../core/services/pago.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-pago-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pago-form.html',
  styleUrl: './pago-form.scss',
})
export class PagoForm implements OnInit {
  formulario!: FormGroup;
  cargando = false;
  cargandoResumen = true;
  resumen: ResumenDeuda | null = null;
  errorPareja = false;

  metodosPago = [
    { value: MetodoPago.EFECTIVO, label: 'Efectivo', icon: 'payments' },
    { value: MetodoPago.TRANSFERENCIA, label: 'Transferencia', icon: 'account_balance' },
    { value: MetodoPago.TARJETA, label: 'Tarjeta', icon: 'credit_card' },
    { value: MetodoPago.OTRO, label: 'Otro', icon: 'more_horiz' }
  ];

  constructor(
    private fb: FormBuilder,
    private pagoService: PagoService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      monto: [null, [Validators.required, Validators.min(0.01)]],
      concepto: [''],
      metodoPago: [MetodoPago.EFECTIVO, Validators.required]
    });

    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargandoResumen = true;
    this.errorPareja = false;

    this.pagoService.obtenerResumenDeuda().subscribe({
      next: (resumen) => {
        this.resumen = resumen;
        this.cargandoResumen = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);

        // Detectar si el error es por falta de pareja
        if (err.status === 400 && err.error?.mensaje?.includes('pareja')) {
          this.errorPareja = true;
        }
        this.cargandoResumen = false;
        this.cdr.detectChanges();
      }
    });
  }

  configurarPareja(): void {
    this.router.navigate(['/pareja/configurar']);
  }

  getReceptorId(): number | null {
    if (!this.resumen) return null;

    // El receptor es la persona a quien se le debe
    const usuario = this.authService.obtenerUsuario();
    if (!usuario) return null;

    // Si el usuario actual es usuario1, el receptor es usuario2 y viceversa
    if (this.resumen.usuario1.id === usuario.id) {
      return this.resumen.usuario2.id;
    }
    return this.resumen.usuario1.id;
  }

  getReceptorNombre(): string {
    if (!this.resumen) return '';

    const usuario = this.authService.obtenerUsuario();
    if (!usuario) return '';

    if (this.resumen.usuario1.id === usuario.id) {
      return this.resumen.usuario2.nombre;
    }
    return this.resumen.usuario1.nombre;
  }

  registrarPago(): void {
    if (this.formulario.invalid) return;

    const receptorId = this.getReceptorId();
    if (!receptorId) {
      this.notificationService.error('No se pudo determinar el receptor del pago');
      return;
    }

    this.cargando = true;
    this.loadingService.show('Registrando pago...');

    this.pagoService.registrarPago({
      receptorId,
      monto: this.formulario.value.monto,
      concepto: this.formulario.value.concepto || undefined,
      metodoPago: this.formulario.value.metodoPago
    }).subscribe({
      next: () => {
        this.loadingService.hide();
        this.notificationService.success('Pago registrado exitosamente');
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loadingService.hide();
        this.cargando = false;
        // El error se maneja automáticamente en el interceptor
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }
}
