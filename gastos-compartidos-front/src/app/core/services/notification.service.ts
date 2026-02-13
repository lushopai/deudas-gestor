import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  /**
   * Muestra un mensaje de éxito
   */
  success(message: string, title: string = '¡Éxito!') {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#1976d2',
      timer: 3000,
      timerProgressBar: true
    });
  }

  /**
   * Muestra un mensaje de error
   */
  error(message: string, title: string = 'Error', details?: string) {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      footer: details ? `<small>${details}</small>` : undefined,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1976d2'
    });
  }

  /**
   * Muestra un mensaje de advertencia
   */
  warning(message: string, title: string = 'Advertencia'): void {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1976d2'
    });
  }

  /**
   * Muestra un mensaje informativo
   */
  info(message: string, title: string = 'Información'): void {
    Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#1976d2'
    });
  }

  /**
   * Muestra una confirmación y retorna la respuesta del usuario
   */
  async confirm(message: string, title: string = '¿Estás seguro?'): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#d33'
    });

    return result.isConfirmed;
  }

  /**
   * Muestra un toast (notificación pequeña) en la esquina
   */
  toast(message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success'): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: icon,
      title: message
    });
  }

  /**
   * Muestra loading mientras se ejecuta una operación
   */
  showLoading(title: string = 'Cargando...', message?: string): void {
    Swal.fire({
      title: title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Cierra el loading de SweetAlert
   */
  closeLoading(): void {
    Swal.close();
  }
}
