import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar token si existe
    const token = this.authService.obtenerToken();

    console.log('🔐 [JWT Interceptor] URL:', request.url);
    console.log('🔐 [JWT Interceptor] Token existe:', !!token);

    if (token && !request.url.includes('/public/')) {
      console.log('✅ [JWT Interceptor] Agregando token a la petición');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.warn('⚠️ [JWT Interceptor] No se agregó token. Token:', !!token, 'URL pública:', request.url.includes('/public/'));
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es 401, intentar refrescar token
        if (error.status === 401) {
          // Por ahora solo logout
          this.authService.logout();
          return throwError(() => error);
        }
        return throwError(() => error);
      })
    );
  }
}
