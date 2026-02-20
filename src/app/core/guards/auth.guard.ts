import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, RolUsuario } from '../services/auth.service';

/**
 * Guard principal: verifica que el usuario esté autenticado
 * y que el token no haya expirado.
 *
 * Uso en routes:
 *   { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent }
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Si no está logueado, redirigir a login guardando la URL destino
  if (!authService.estaLogueado()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: route.url.join('/') }
    });
    return false;
  }

  // Si el token expiró (verificación de la firma), limpiar y redirigir
  if (!authService.tokenEstaVigente()) {
    authService.logout();
    router.navigate(['/login'], {
      queryParams: { sessionExpired: 'true' }
    });
    return false;
  }

  return true;
};


/**
 * Guard de roles: permite acceso solo a los roles indicados en route.data.
 *
 * Uso en routes:
 *   {
 *     path: 'admin',
 *     canActivate: [authGuard, rolesGuard],
 *     data: { roles: ['ADMINISTRADOR'] },
 *     component: AdminComponent
 *   }
 */
export const rolesGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService  = inject(AuthService);
  const router       = inject(Router);

  const rolesPermitidos: RolUsuario[] = route.data?.['roles'] ?? [];

  // Sin restricción de rol definida → permitir
  if (rolesPermitidos.length === 0) return true;

  const usuario = authService.usuario();
  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  const tienePermiso = rolesPermitidos.includes(usuario.rol);
  if (!tienePermiso) {
    router.navigate(['/sin-permisos']);
  }

  return tienePermiso;
};


/**
 * Guard inverso: redirige al dashboard si el usuario YA está logueado.
 * Útil para login y register (evita entrar si ya hay sesión activa).
 *
 * Uso en routes:
 *   { path: 'login', canActivate: [noAuthGuard], component: LoginComponent }
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.estaLogueado() && authService.tokenEstaVigente()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};