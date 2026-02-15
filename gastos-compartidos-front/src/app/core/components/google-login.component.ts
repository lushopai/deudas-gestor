import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './google-login.component.html',
  styleUrls: ['./google-login.component.scss']
})
export class GoogleLoginComponent implements OnInit, AfterViewInit {
  cargando = false;
  error: string | null = null;
  clientId: string;

  constructor(private authService: AuthService, private router: Router) {
    this.clientId = environment.google.clientId;
  }

  ngOnInit(): void {
    this.esperarGoogleSDK();
  }

  ngAfterViewInit(): void {
    this.inicializarGoogleSignIn();
  }

  private esperarGoogleSDK(): void {
    // Esperar a que Google SDK se cargue
    const maxAttempts = 20;
    let attempts = 0;
    
    const interval = setInterval(() => {
      attempts++;
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error('Google SDK no se pudo cargar');
        this.error = 'No se pudo cargar Google Sign-In';
      }
    }, 100);
  }

  private inicializarGoogleSignIn(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      try {
        if (!this.clientId) {
          throw new Error('Client ID no está configurado');
        }

        google.accounts.id.initialize({
          client_id: this.clientId,
          callback: (response: any) => this.manejarRespuestaGoogle(response),
          error_callback: () => {
            console.error('Error al inicializar Google Sign-In');
            this.error = 'Error al inicializar Google Sign-In';
          }
        });
        
        // Renderizar el botón de Google
        this.renderizarBoton();
      } catch (e) {
        console.error('Error en inicializarGoogleSignIn:', e);
        this.error = String(e);
      }
    } else {
      setTimeout(() => this.inicializarGoogleSignIn(), 500);
    }
  }

  private renderizarBoton(): void {
    const buttonDiv = document.getElementById('google-button-div');
    if (buttonDiv && buttonDiv.childNodes.length === 0) {
      google.accounts.id.renderButton(buttonDiv, {
        type: 'standard',
        size: 'large',
        text: 'signin_with',
        locale: 'es'
      });
    }
  }

  iniciarLoginGoogle(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt();
    } else {
      this.error = 'Google Sign-In no está disponible';
    }
  }

  private manejarRespuestaGoogle(response: any): void {
    if (response.credential) {
      this.cargando = true;
      this.error = null;

      this.authService.loginConGoogle(response.credential).subscribe({
        next: () => {
          this.cargando = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.cargando = false;
          this.error = err?.error?.message || 'Error al iniciar sesión con Google';
          console.error('Error Google Login:', err);
        }
      });
    }
  }
}
