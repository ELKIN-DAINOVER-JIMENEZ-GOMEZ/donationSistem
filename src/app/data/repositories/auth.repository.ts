import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import {
  LoginRequestDTO,
  LoginResponseDTO,
  RegisterRequestDTO,
  UsuarioResponseDTO,
  UsuarioActualizacionDTO,
  AuthErrorResponseDTO,
  buildLoginRequest,
  buildRegisterRequest,
} from '../dto/loginRequest.dto';

import { RolUsuario } from '../models/usuario.model';

/**
 * AuthRepository
 *
 * Capa de acceso a datos para autenticación y gestión de usuarios.
 * Encapsula todas las llamadas HTTP relacionadas con /api/auth y /api/usuarios.
 *
 * ¿Por qué un repository y no el AuthService directamente?
 * → El AuthService gestiona el estado reactivo de la sesión (señales, localStorage).
 *   El repository solo sabe cómo comunicarse con el backend. Separación de concerns.
 */
@Injectable({ providedIn: 'root' })
export class AuthRepository {

  private readonly http     = inject(HttpClient);
  private readonly authUrl  = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/usuarios`;

  // ── Autenticación ──────────────────────────────────────────────────────────

  /**
   * Realiza el login contra el backend.
   * POST /api/auth/login
   */
  login(email: string, password: string): Observable<LoginResponseDTO> {
    const body = buildLoginRequest(email, password);
    return this.http
      .post<LoginResponseDTO>(`${this.authUrl}/login`, body)
      .pipe(catchError(this._handleAuthError));
  }

  // ── Registro ───────────────────────────────────────────────────────────────

  /**
   * Registra un nuevo usuario.
   * POST /api/usuarios/registro
   */
  registrar(data: RegisterRequestDTO): Observable<UsuarioResponseDTO> {
    const body = buildRegisterRequest(data);
    return this.http
      .post<UsuarioResponseDTO>(`${this.usersUrl}/registro`, body)
      .pipe(catchError(this._handleAuthError));
  }

  // ── CRUD de usuarios (requiere token via JWT interceptor) ──────────────────

  /**
   * Obtiene todos los usuarios.
   * GET /api/usuarios
   */
  obtenerTodos(): Observable<UsuarioResponseDTO[]> {
    return this.http
      .get<UsuarioResponseDTO[]>(this.usersUrl)
      .pipe(catchError(this._handleError));
  }

  /**
   * Obtiene un usuario por ID.
   * GET /api/usuarios/:id
   */
  obtenerPorId(id: number): Observable<UsuarioResponseDTO> {
    return this.http
      .get<UsuarioResponseDTO>(`${this.usersUrl}/${id}`)
      .pipe(catchError(this._handleError));
  }

  /**
   * Obtiene un usuario por email.
   * GET /api/usuarios/email/:email
   */
  obtenerPorEmail(email: string): Observable<UsuarioResponseDTO> {
    return this.http
      .get<UsuarioResponseDTO>(`${this.usersUrl}/email/${encodeURIComponent(email)}`)
      .pipe(catchError(this._handleError));
  }

  /**
   * Obtiene usuarios por rol.
   * GET /api/usuarios/rol/:rol
   */
  obtenerPorRol(rol: RolUsuario): Observable<UsuarioResponseDTO[]> {
    return this.http
      .get<UsuarioResponseDTO[]>(`${this.usersUrl}/rol/${rol}`)
      .pipe(catchError(this._handleError));
  }

  /**
   * Obtiene todos los usuarios activos.
   * GET /api/usuarios/activos
   */
  obtenerActivos(): Observable<UsuarioResponseDTO[]> {
    return this.http
      .get<UsuarioResponseDTO[]>(`${this.usersUrl}/activos`)
      .pipe(catchError(this._handleError));
  }

  /**
   * Busca usuarios por nombre (búsqueda parcial).
   * GET /api/usuarios/buscar?nombre=...
   */
  buscarPorNombre(nombre: string): Observable<UsuarioResponseDTO[]> {
    return this.http
      .get<UsuarioResponseDTO[]>(`${this.usersUrl}/buscar`, {
        params: { nombre: nombre.trim() },
      })
      .pipe(catchError(this._handleError));
  }

  /**
   * Actualiza los datos de un usuario.
   * PUT /api/usuarios/:id
   */
  actualizar(id: number, datos: UsuarioActualizacionDTO): Observable<UsuarioResponseDTO> {
    return this.http
      .put<UsuarioResponseDTO>(`${this.usersUrl}/${id}`, datos)
      .pipe(catchError(this._handleError));
  }

  /**
   * Cambia el rol de un usuario (solo ADMINISTRADOR).
   * PATCH /api/usuarios/:id/rol?rol=...
   */
  cambiarRol(id: number, rol: RolUsuario): Observable<UsuarioResponseDTO> {
    return this.http
      .patch<UsuarioResponseDTO>(`${this.usersUrl}/${id}/rol`, null, {
        params: { rol },
      })
      .pipe(catchError(this._handleError));
  }

  /**
   * Activa o desactiva un usuario (solo ADMINISTRADOR).
   * PATCH /api/usuarios/:id/estado?activo=...
   */
  cambiarEstado(id: number, activo: boolean): Observable<UsuarioResponseDTO> {
    return this.http
      .patch<UsuarioResponseDTO>(`${this.usersUrl}/${id}/estado`, null, {
        params: { activo: String(activo) },
      })
      .pipe(catchError(this._handleError));
  }

  /**
   * Elimina (desactiva) un usuario.
   * DELETE /api/usuarios/:id
   */
  eliminar(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.usersUrl}/${id}`)
      .pipe(catchError(this._handleError));
  }

  // ── Manejo de errores ──────────────────────────────────────────────────────

  /**
   * Manejo específico para errores de autenticación (401 / 403).
   * Transforma el error HTTP en un mensaje legible para el usuario.
   */
  private _handleAuthError(error: HttpErrorResponse): Observable<never> {
    let msg: string;

    if (error.status === 401) {
      msg = (error.error as AuthErrorResponseDTO)?.message
        ?? 'Credenciales inválidas. Verifica tu correo y contraseña.';
    } else if (error.status === 403) {
      msg = (error.error as AuthErrorResponseDTO)?.message
        ?? 'Tu cuenta está inactiva. Contacta al administrador.';
    } else if (error.status === 409) {
      msg = 'Ya existe una cuenta con ese correo electrónico.';
    } else if (error.status === 0) {
      msg = 'Error de conexión. Verifica tu red e intenta nuevamente.';
    } else {
      msg = `Error inesperado (${error.status}). Intenta más tarde.`;
    }

    return throwError(() => new Error(msg));
  }

  /**
   * Manejo genérico de errores para endpoints protegidos.
   */
  private _handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.status === 0
      ? 'Error de conexión.'
      : error.error?.mensaje ?? error.message ?? `Error ${error.status}`;

    return throwError(() => new Error(msg));
  }
}