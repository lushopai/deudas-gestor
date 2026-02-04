import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  usuario: any;
  cargando = false;
  guardando = false;
  error: string | null = null;
  previewFoto: string | null = null;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    this.authService.usuario$.subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        if (usuario) {
          this.previewFoto = usuario.fotoPerfil;
          this.actualizarFormulario(usuario);
        } else {
          this.error = "No se encontró información del usuario.";
        }
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.error = 'No se pudo cargar el perfil';
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    });
  }

  inicializarFormulario() {
    this.perfilForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, Validators.required],
      telefono: [''],
      bio: ['', Validators.maxLength(500)]
    });
  }

  actualizarFormulario(usuario: any) {
    this.perfilForm.patchValue({
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      bio: usuario.bio || ''
    });
  }

  seleccionarFoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.procesarFoto(file);
      }
    });
    input.click();
  }

  procesarFoto(file: File) {
    if (!file.type.match(/image\*/)) {
      this.snackBar.open('Por favor selecciona una imagen válida', 'Cerrar', { duration: 3000 });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.snackBar.open('La imagen no debe superar 5MB', 'Cerrar', { duration: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewFoto = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  guardarCambios() {
    if (this.perfilForm.invalid) {
      this.snackBar.open('Por favor completa el formulario correctamente', 'Cerrar', { duration: 3000 });
      return;
    }

    this.guardando = true;
    const datosActualizados = {
      ...this.perfilForm.getRawValue(),
      fotoPerfil: this.previewFoto
    };

    // TODO: Implementar servicio de actualización de usuario
    console.log('Guardando:', datosActualizados);

    // Simulación
    setTimeout(() => {
      this.guardando = false;
      this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 3000 });
    }, 1000);
  }

  cancelar() {
    this.router.navigate(['/dashboard']);
  }

  // Obtener iniciales del usuario para avatar
  getInitials(nombre: string | undefined): string {
    if (!nombre) return 'U';

    const nombreParts = nombre.trim().split(' ');
    if (nombreParts.length >= 2) {
      return (nombreParts[0][0] + nombreParts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
