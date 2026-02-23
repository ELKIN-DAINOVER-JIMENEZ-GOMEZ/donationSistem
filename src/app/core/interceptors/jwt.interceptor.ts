import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * JWT Interceptor (functional, Angular 17+)
 *
 * Responsabilidades:
 *  1. Agrega el header "Authorization: Bearer <token>" a cada request saliente.
 *  2. Si el backend responde 401, limpia la sesión y redirige a /login.
 *  3. Si el backend responde 403, reenvía el error al componente (que mostrará
 *     el mensaje a través del errorInterceptor / NotificacionService).
 *     ⚠️ NO redirige a /sin-permisos porque esa ruta no existe.
 *  4. Rutas públicas (whitelist) pasan sin token aunque el usuario esté logueado.
 */

/** Rutas que NO necesitan token */
const PUBLIC_URLS: string[] = [
  '/api/auth/login',
  '/api/usuarios/registro',
];

const esPublica = (url: string): boolean =>
  PUBLIC_URLS.some(pub => url.includes(pub));

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);
  const router      = inject(Router);

  // Si la URL es pública o no hay token, pasar sin modificar
  const bearer = authService.getBearerToken();
  if (!bearer || esPublica(req.url)) {
    return next(req);
  }

  // Clonar la request agregando el header de autorización
  const authReq = req.clone({
    setHeaders: { Authorization: bearer }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        // Token expirado o inválido → limpiar sesión y redirigir al login
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { sessionExpired: 'true' }
        });
      }

      // 403: sin permisos → el errorInterceptor muestra la notificación toast.
      // No redirigimos porque /sin-permisos no está en las rutas de la app.

      return throwError(() => error);
    })
  );
};

