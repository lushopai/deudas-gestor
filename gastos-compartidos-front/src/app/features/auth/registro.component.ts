import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroComponent implements OnInit {
  formulario: FormGroup;
  cargando = false;
  mostrarPassword = false;
  validacionesError: { [key: string]: string[] } = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido: ['', [Validators.maxLength(50)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        RegistroComponent.passwordPatternValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      nombrePareja: ['', [Validators.maxLength(100)]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.valueChanges.subscribe(() => {
        this.actualizarValidacionesError(key);
      });
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
  }

  static passwordPatternValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    const valid = regexPassword.test(control.value);
    return valid ? null : {
      'passwordPattern': true,
      'message': 'La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'
    };
  }

  actualizarValidacionesError(fieldName: string): void {
    const field = this.formulario.get(fieldName);
    this.validacionesError[fieldName] = [];

    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        this.validacionesError[fieldName].push(`${this.getNombreCampo(fieldName)} es requerido`);
      }
      if (field.errors['email']) {
        this.validacionesError[fieldName].push('El email debe ser válido (ej: usuario@ejemplo.com)');
      }
      if (field.errors['minlength']) {
        const min = field.errors['minlength'].requiredLength;
        this.validacionesError[fieldName].push(`Mínimo ${min} caracteres`);
      }
      if (field.errors['maxlength']) {
        const max = field.errors['maxlength'].requiredLength;
        this.validacionesError[fieldName].push(`Máximo ${max} caracteres`);
      }
      if (field.errors['passwordPattern']) {
        this.validacionesError[fieldName].push(field.errors['passwordPattern'].message || 'Formato de contraseña inválido');
      }
    }
  }

  validarPassword(password: string): string[] {
    const errores: string[] = [];

    if (password.length < 8) {
      errores.push('Mínimo 8 caracteres');
    }
    if (!/[a-z]/.test(password)) {
      errores.push('Al menos una letra minúscula');
    }
    if (!/[A-Z]/.test(password)) {
      errores.push('Al menos una letra mayúscula');
    }
    if (!/\d/.test(password)) {
      errores.push('Al menos un número');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errores.push('Al menos un carácter especial (@$!%*?&)');
    }

    return errores;
  }

  getNombreCampo(fieldName: string): string {
    const nombres: { [key: string]: string } = {
      email: 'Email',
      nombre: 'Nombre',
      apellido: 'Apellido',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      nombrePareja: 'Nombre de la pareja'
    };
    return nombres[fieldName] || fieldName;
  }

  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  getPasswordErrors(): string[] {
    const password = this.formulario.get('password')?.value;
    return password ? this.validarPassword(password) : [];
  }

  checkPassword(requirement: string): boolean {
    const password = this.formulario.get('password')?.value || '';

    switch (requirement) {
      case 'lowercase':
        return /[a-z]/.test(password);
      case 'uppercase':
        return /[A-Z]/.test(password);
      case 'number':
        return /\d/.test(password);
      case 'special':
        return /[@$!%*?&]/.test(password);
      case 'length':
        return password.length >= 8;
      default:
        return false;
    }
  }

  tieneError(fieldName: string): boolean {
    const field = this.formulario.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  registro(): void {
    if (this.formulario.invalid) {
      Object.keys(this.formulario.controls).forEach(key => {
        this.formulario.get(key)?.markAsTouched();
        this.actualizarValidacionesError(key);
      });
      this.notificationService.warning('Por favor, completa todos los campos correctamente');
      return;
    }

    this.cargando = true;
    const { confirmPassword, ...datos } = this.formulario.value;

    this.authService.registro(datos).subscribe({
      next: () => {
        this.cargando = false;
        this.notificationService.success('¡Cuenta creada exitosamente!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        const mensaje = err.error?.mensaje || err.error?.message || 'Error al crear la cuenta';
        this.notificationService.error(mensaje);
      }
    });
  }
}
