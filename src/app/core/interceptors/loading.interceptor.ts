import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Loading Interceptor (functional, Angular 17+)
 *
 * Activa el spinner global automáticamente en cada request HTTP
 * y lo desactiva cuando la respuesta llega (o si falla).
 *
 * Para excluir una request del spinner, agrega el header:
 *   headers: { 'X-Skip-Loading': 'true' }
 */
export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const loadingService = inject(LoadingService);

  // Respetar el flag de exclusión
  if (req.headers.has('X-Skip-Loading')) {
    const reqSinHeader = req.clone({
      headers: req.headers.delete('X-Skip-Loading')
    });
    return next(reqSinHeader);
  }

  // Clave única para esta request (evita conflictos entre simultáneas)
  const clave = `${req.method}:${req.url}`;
  loadingService.mostrar(clave);

  return next(req).pipe(
    finalize(() => loadingService.ocultar(clave))
  );
};