import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';

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
    MatMenuModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfilForm!: FormGroup;
  passwordForm!: FormGroup;
  usuario: any;
  cargando = false;
  guardando = false;
  guardandoPassword = false;
  mostrarFormPassword = false;
  error: string | null = null;
  previewFoto: string | null = null;
  hidePasswordActual = true;
  hidePasswordNueva = true;
  hideConfirmar = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.inicializarFormulario();
    this.inicializarPasswordForm();
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    this.error = null;
    this.apiService.obtenerPerfil().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.previewFoto = usuario.fotoPerfil;
        this.actualizarFormulario(usuario);
        this.cargando = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        // Fallback: usar datos del localStorage
        const usuarioLocal = this.authService.obtenerUsuario();
        if (usuarioLocal) {
          this.usuario = usuarioLocal;
          this.previewFoto = usuarioLocal.fotoPerfil;
          this.actualizarFormulario(usuarioLocal);
        } else {
          this.error = 'No se pudo cargar el perfil';
        }
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
    if (!file.type.startsWith('image/')) {
      this.notificationService.warning('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.warning('La imagen no debe superar 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewFoto = e.target.result;
      this.cdRef.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  guardarCambios() {
    if (this.perfilForm.invalid) {
      this.notificationService.warning('Por favor completa el formulario correctamente');
      return;
    }

    this.guardando = true;
    this.loadingService.show('Guardando perfil...');

    const datos = {
      nombre: this.perfilForm.get('nombre')?.value,
      telefono: this.perfilForm.get('telefono')?.value || null,
      bio: this.perfilForm.get('bio')?.value || null,
      fotoPerfil: this.previewFoto
    };

    this.apiService.actualizarPerfil(datos).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = usuarioActualizado;
        // Actualizar datos en localStorage para mantener sincronización
        const usuarioLocal = this.authService.obtenerUsuario();
        if (usuarioLocal) {
          const actualizado = { ...usuarioLocal, ...usuarioActualizado };
          localStorage.setItem('gastos_usuario', JSON.stringify(actualizado));
        }
        this.guardando = false;
        this.loadingService.hide();
        this.notificationService.success('Perfil actualizado correctamente');
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar perfil:', err);
        this.guardando = false;
        this.loadingService.hide();
        this.cdRef.detectChanges();
      }
    });
  }

  inicializarPasswordForm() {
    this.passwordForm = this.formBuilder.group({
      passwordActual: ['', Validators.required],
      passwordNueva: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      ]],
      confirmarPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('passwordNueva')?.value;
    const confirm = group.get('confirmarPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  toggleFormPassword() {
    this.mostrarFormPassword = !this.mostrarFormPassword;
    if (!this.mostrarFormPassword) {
      this.passwordForm.reset();
    }
  }

  cambiarPassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.guardandoPassword = true;
    this.loadingService.show('Cambiando contraseña...');

    const datos = {
      passwordActual: this.passwordForm.get('passwordActual')?.value,
      passwordNueva: this.passwordForm.get('passwordNueva')?.value
    };

    this.apiService.cambiarPassword(datos).subscribe({
      next: () => {
        this.guardandoPassword = false;
        this.loadingService.hide();
        this.notificationService.success('Contraseña actualizada correctamente');
        this.mostrarFormPassword = false;
        this.passwordForm.reset();
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.guardandoPassword = false;
        this.loadingService.hide();
        const mensaje = err.error?.message || err.error?.mensaje || 'Error al cambiar la contraseña';
        this.notificationService.error(mensaje);
        this.cdRef.detectChanges();
      }
    });
  }

  cancelar() {
    this.router.navigate(['/dashboard']);
  }

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
