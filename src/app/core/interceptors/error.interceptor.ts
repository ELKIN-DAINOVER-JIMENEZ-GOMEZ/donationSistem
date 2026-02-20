import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, catchError } from 'rxjs';
import { NotificacionService } from '../services/notificacion.service';
import { AuthService } from '../services/auth.service';

/**
 * Error Interceptor (functional, Angular 17+)
 *
 * Centraliza el manejo de errores HTTP:
 *  - 400: Error de validación → muestra el mensaje del backend
 *  - 401: No autenticado → lo maneja el JWT interceptor
 *  - 403: Sin permisos → notifica al usuario
 *  - 404: Recurso no encontrado
 *  - 409: Conflicto (ej: email duplicado)
 *  - 500+: Error del servidor
 *  - 0 / network error: Sin conexión
 *
 * Para suprimir el toast en un caso específico, agrega:
 *   headers: { 'X-Skip-Error-Toast': 'true' }
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const notificaciones = inject(NotificacionService);
  const authService    = inject(AuthService);

  const silencioso = req.headers.has('X-Skip-Error-Toast');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // 401 ya lo maneja el jwt.interceptor → solo re-lanzar
      if (error.status === 401) {
        return throwError(() => error);
      }

      if (!silencioso) {
        const { titulo, mensaje } = _resolverMensaje(error);
        notificaciones.error(titulo, mensaje);
      }

      return throwError(() => error);
    })
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _resolverMensaje(error: HttpErrorResponse): {
  titulo: string;
  mensaje?: string;
} {
  // Sin red / CORS / timeout
  if (error.status === 0) {
    return {
      titulo: 'Sin conexión',
      mensaje: 'Verifica tu conexión a internet e intenta de nuevo.',
    };
  }

  // El backend envió un mensaje legible
  const backendMsg: string | undefined =
    error.error?.message ?? error.error?.error ?? error.error;

  const esMensajeUtil =
    typeof backendMsg === 'string' && backendMsg.length < 200;

  switch (error.status) {
    case 400:
      return {
        titulo: 'Datos inválidos',
        mensaje: esMensajeUtil ? backendMsg : 'Revisa los datos ingresados.',
      };
    case 403:
      return {
        titulo: 'Sin permisos',
        mensaje: 'No tienes acceso a este recurso.',
      };
    case 404:
      return {
        titulo: 'No encontrado',
        mensaje: esMensajeUtil ? backendMsg : 'El recurso solicitado no existe.',
      };
    case 409:
      return {
        titulo: 'Conflicto',
        mensaje: esMensajeUtil
          ? backendMsg
          : 'Ya existe un registro con esos datos.',
      };
    case 422:
      return {
        titulo: 'Error de validación',
        mensaje: esMensajeUtil ? backendMsg : 'Los datos no cumplen las reglas.',
      };
    default:
      if (error.status >= 500) {
        return {
          titulo: 'Error del servidor',
          mensaje: 'Ocurrió un error inesperado. Intenta más tarde.',
        };
      }
      return {
        titulo: `Error ${error.status}`,
        mensaje: esMensajeUtil ? backendMsg : error.statusText,
      };
  }
}