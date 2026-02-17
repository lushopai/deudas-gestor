import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { GoogleLoginComponent } from '../../core/components/google-login.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    GoogleLoginComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  formulario: FormGroup;
  cargando = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  iniciarSesion() {
    if (this.formulario.invalid) {
      this.notificationService.warning('Por favor, completa todos los campos correctamente');
      return;
    }

    this.cargando = true;
    const { email, password } = this.formulario.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.cargando = false;
        this.notificationService.toast('¡Bienvenido!', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        const mensaje = err.error?.mensaje || err.error?.message || 'Credenciales incorrectas';
        this.notificationService.error(mensaje);
      }
    });
  }
}
