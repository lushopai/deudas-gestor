import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Ocultar loading si está activo
        this.loadingService.hide();

        let errorMessage = 'Ha ocurrido un error inesperado';
        let showNotification = true;

        // Detectar si es ruta de autenticación (login/registro)
        const isAuthRoute = request.url.includes('/auth/');

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
              errorMessage = error.error?.mensaje || error.error?.message || 'Solicitud inválida';

              // No mostrar notificación para errores de pareja incompleta (manejados por componentes)
              // Incluye: /mi-pareja, /pagos/resumen, /gastos/resumen cuando falta el 2do miembro
              if (errorMessage.includes('2 usuarios') || errorMessage.includes('pareja debe tener')) {
                showNotification = false;
              }
              // Tampoco para errores genéricos de /mi-pareja
              if (request.url.includes('/mi-pareja') && errorMessage.includes('pareja')) {
                showNotification = false;
              }
              break;

            case 401:
              if (isAuthRoute) {
                // Error de credenciales en login
                errorMessage = error.error?.mensaje || 'Credenciales incorrectas';
              } else {
                // Sesión expirada en otras rutas
                errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
                this.authService.logout();
                this.router.navigate(['/login']);
              }
              break;

            case 403:
              // Prohibido - Token inválido o expirado
              errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
              this.authService.logout();
              this.router.navigate(['/login']);
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

        // No mostrar notificación para rutas de auth (el componente lo maneja)
        if (isAuthRoute) {
          showNotification = false;
        }

        // Mostrar notificación de error (excepto casos especiales)
        if (showNotification) {
          this.notificationService.error(errorMessage);
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url
        });

        return throwError(() => error);
      })
    );
  }
}
