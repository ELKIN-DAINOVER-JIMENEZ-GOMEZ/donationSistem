import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;        // "Bearer"
  email: string;
  nombre: string;
  rol: RolUsuario;
  userId: number;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  organizacion?: string;
  rol: RolUsuario;
  password: string;
}

export interface UsuarioSesion {
  userId: number;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

export type RolUsuario = 'DONANTE' | 'LIDER_SOCIAL' | 'ADMINISTRADOR';

// ─── Claves de almacenamiento ──────────────────────────────────────────────────

const TOKEN_KEY   = 'donavida_token';
const USER_KEY    = 'donavida_user';

// ─── Servicio ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Señales reactivas (Angular 17+)
  private _token   = signal<string | null>(this._loadToken());
  private _usuario = signal<UsuarioSesion | null>(this._loadUsuario());

  // Computadas públicas (solo lectura)
  readonly token        = this._token.asReadonly();
  readonly usuario      = this._usuario.asReadonly();
  readonly estaLogueado = computed(() => !!this._token());
  readonly esAdmin      = computed(() => this._usuario()?.rol === 'ADMINISTRADOR');
  readonly esLider      = computed(() => this._usuario()?.rol === 'LIDER_SOCIAL');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ── Login ──────────────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => this._guardarSesion(response)),
        catchError(error => {
          const msg = error.status === 401
            ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
            : error.status === 403
              ? 'Tu cuenta está inactiva. Contacta al administrador.'
              : 'Error de conexión. Intenta nuevamente.';
          return throwError(() => new Error(msg));
        })
      );
  }

  // ── Registro ───────────────────────────────────────────────────────────────

  registrar(datos: RegisterRequest): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}/usuarios/registro`, datos)
      .pipe(
        catchError(error => {
          const msg = error.status === 409
            ? 'Ya existe una cuenta con ese correo electrónico.'
            : 'No se pudo crear la cuenta. Intenta nuevamente.';
          return throwError(() => new Error(msg));
        })
      );
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._usuario.set(null);
    this.router.navigate(['/login']);
  }

  // ── Helpers públicos ───────────────────────────────────────────────────────

  /** Devuelve el token con prefijo "Bearer " listo para el header */
  getBearerToken(): string | null {
    const t = this._token();
    return t ? `Bearer ${t}` : null;
  }

  /** Verifica si el token JWT ha expirado leyendo el payload */
  tokenEstaVigente(): boolean {
    const token = this._token();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp viene en segundos
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // ── Privados ───────────────────────────────────────────────────────────────

  private _guardarSesion(response: LoginResponse): void {
    const sesion: UsuarioSesion = {
      userId: response.userId,
      email: response.email,
      nombre: response.nombre,
      rol: response.rol,
    };
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(sesion));
    this._token.set(response.token);
    this._usuario.set(sesion);
  }

  private _loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private _loadUsuario(): UsuarioSesion | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioSesion;
    } catch {
      return null;
    }
  }
}