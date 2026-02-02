import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    // Alerta de éxito
    success(message: string, title: string = '¡Éxito!') {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1976d2',
            timer: 3000,
            timerProgressBar: true
        });
    }

    // Alerta de error
    error(message: string, title: string = 'Error', details?: string) {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            footer: details ? `<small>${details}</small>` : undefined,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#1976d2'
        });
    }

    // Alerta de advertencia
    warning(message: string, title: string = 'Atención') {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: message,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1976d2'
        });
    }

    // Alerta de información
    info(message: string, title: string = 'Información') {
        return Swal.fire({
            icon: 'info',
            title: title,
            text: message,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1976d2'
        });
    }

    // Confirmación
    confirm(message: string, title: string = '¿Estás seguro?') {
        return Swal.fire({
            icon: 'question',
            title: title,
            text: message,
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#1976d2',
            cancelButtonColor: '#757575',
            reverseButtons: true
        });
    }

    // Alerta de carga
    loading(message: string = 'Procesando...') {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    // Cerrar alerta de carga
    close() {
        Swal.close();
    }

    // Toast (notificación pequeña)
    toast(message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') {
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

        return Toast.fire({
            icon: icon,
            title: message
        });
    }
}
