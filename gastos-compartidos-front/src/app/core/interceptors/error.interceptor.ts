import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Ocultar loading si está activo
        this.loadingService.hide();

        let errorMessage = 'Ha ocurrido un error inesperado';
        let showNotification = true;

        // Manejar errores específicos
        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del servidor
          switch (error.status) {
            case 0:
              errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
              break;

            case 400:
              // Bad Request - Mostrar mensaje del servidor
              errorMessage = error.error?.mensaje || error.error?.message || 'Solicitud inválida';

              // No mostrar notificación para errores de pareja (manejados por componente)
              if (errorMessage.includes('pareja')) {
                showNotification = false;
              }
              break;

            case 401:
              // No autorizado - Redirigir al login
              errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
              localStorage.removeItem('token');
              this.router.navigate(['/login']);
              break;

            case 403:
              errorMessage = 'No tienes permisos para realizar esta acción.';
              break;

            case 404:
              errorMessage = error.error?.mensaje || 'Recurso no encontrado';
              break;

            case 500:
              errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
              break;

            case 503:
              errorMessage = 'Servicio no disponible. El servidor está en mantenimiento.';
              break;

            default:
              errorMessage = error.error?.mensaje || error.error?.message || errorMessage;
          }
        }

        // Mostrar notificación de error (excepto casos especiales)
        if (showNotification) {
          this.notificationService.error(errorMessage);
        }

        // Log del error para debugging
        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          error: error
        });

        return throwError(() => error);
      })
    );
  }
}
