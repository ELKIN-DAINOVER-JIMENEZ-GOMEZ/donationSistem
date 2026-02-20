import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import {
  DonacionRequestDTO,
  DonacionResponseDTO,
  ConfirmarDonacionParams,
  RechazarDonacionParams,
  DonacionFechasFiltroDTO,
  TotalDonadoResponseDTO,
  RankingDonanteResponseDTO,
  EstadisticasDonanteResponseDTO,
  toDonacionDomain,
  toRankingDonanteDomain,
  toEstadisticasDomain,
  buildDonacionRequest,
} from '../dto/donacionRequest.dto';

import {
  Donacion,
  TipoDonacion,
  EstadoDonacion,
  RankingDonante,
  EstadisticasDonante,
} from '../models/donacion.model';

/**
 * DonacionRepository
 *
 * Capa de acceso a datos para el módulo de donaciones.
 * Encapsula todas las llamadas HTTP a /api/donaciones.
 *
 * Responsabilidades:
 *  - Hablar con el backend (HTTP)
 *  - Convertir DTOs → modelos de dominio
 *  - Transformar errores HTTP en mensajes legibles
 *
 * NO gestiona estado reactivo ni lógica de negocio.
 * Eso pertenece al feature service o al component.
 */
@Injectable({ providedIn: 'root' })
export class DonacionRepository {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/donaciones`;

  // ── Crear ──────────────────────────────────────────────────────────────────

  /**
   * Crea una nueva donación.
   * POST /api/donaciones
   */
  crear(
    usuarioId: number,
    data: Omit<DonacionRequestDTO, 'usuarioId'>
  ): Observable<Donacion> {
    const body = buildDonacionRequest(usuarioId, data);
    return this.http
      .post<DonacionResponseDTO>(this.baseUrl, body)
      .pipe(
        map(toDonacionDomain),
        catchError(this._handleError),
      );
  }

  // ── Consultar ──────────────────────────────────────────────────────────────

  /**
   * Obtiene todas las donaciones.
   * GET /api/donaciones
   */
  listarTodas(): Observable<Donacion[]> {
    return this.http
      .get<DonacionResponseDTO[]>(this.baseUrl)
      .pipe(
        map(dtos => dtos.map(toDonacionDomain)),
        catchError(this._handleError),
      );
  }

  /**
   * Obtiene una donación por ID.
   * GET /api/donaciones/:id
   */
  buscarPorId(id: number): Observable<Donacion> {
    return this.http
      .get<DonacionResponseDTO>(`${this.baseUrl}/${id}`)
      .pipe(
        map(toDonacionDomain),
        catchError(this._handleError),
      );
  }

  /**
   * Obtiene las donaciones de un usuario.
   * GET /api/donaciones/usuario/:usuarioId
   */
  buscarPorUsuario(usuarioId: number): Observable<Donacion[]> {
    return this.http
      .get<DonacionResponseDTO[]>(`${this.baseUrl}/usuario/${usuarioId}`)
      .pipe(
        map(dtos => dtos.map(toDonacionDomain)),
        catchError(this._handleError),
      );
  }

  /**
   * Obtiene donaciones filtradas por estado.
   * GET /api/donaciones/estado/:estado
   */
  buscarPorEstado(estado: EstadoDonacion): Observable<Donacion[]> {
    return this.http
      .get<DonacionResponseDTO[]>(`${this.baseUrl}/estado/${estado}`)
      .pipe(
        map(dtos => dtos.map(toDonacionDomain)),
        catchError(this._handleError),
      );
  }

  /**
   * Obtiene donaciones filtradas por tipo.
   * GET /api/donaciones/tipo/:tipo
   */
  buscarPorTipo(tipo: TipoDonacion): Observable<Donacion[]> {
    return this.http
      .get<DonacionResponseDTO[]>(`${this.baseUrl}/tipo/${tipo}`)
      .pipe(
        map(dtos => dtos.map(toDonacionDomain)),
        catchError(this._handleError),
      );
  }

  /**
   * Obtiene donaciones en un rango de fechas.
   * GET /api/donaciones/fechas?inicio=...&fin=...
   */
  buscarPorFechas(filtro: DonacionFechasFiltroDTO): Observable<Donacion[]> {
    return this.http
      .get<DonacionResponseDTO[]>(`${this.baseUrl}/fechas`, {
        params: {
          inicio: filtro.inicio,
          fin:    filtro.fin,
        },
      })
      .pipe(
        map(dtos => dtos.map(toDonacionDomain)),
        catchError(this._handleError),
      );
  }

  /**
   * Obtiene el total donado por un usuario (solo confirmadas).
   * GET /api/donaciones/usuario/:usuarioId/total
   */
  calcularTotalDonado(usuarioId: number): Observable<number> {
    return this.http
      .get<TotalDonadoResponseDTO>(`${this.baseUrl}/usuario/${usuarioId}/total`)
      .pipe(
        map(res => res.totalDonado),
        catchError(this._handleError),
      );
  }

  // ── Confirmar / Rechazar (Admin) ───────────────────────────────────────────

  /**
   * Confirma una donación pendiente.
   * PATCH /api/donaciones/:id/confirmar?notas=...
   */
  confirmar(id: number, params?: ConfirmarDonacionParams): Observable<void> {
    const queryParams: Record<string, string> = {};
    if (params?.notas) queryParams['notas'] = params.notas;

    return this.http
      .patch<void>(`${this.baseUrl}/${id}/confirmar`, null, {
        params: queryParams,
      })
      .pipe(catchError(this._handleError));
  }

  /**
   * Rechaza una donación pendiente.
   * PATCH /api/donaciones/:id/rechazar?motivo=...
   */
  rechazar(id: number, params: RechazarDonacionParams): Observable<void> {
    return this.http
      .patch<void>(`${this.baseUrl}/${id}/rechazar`, null, {
        params: { motivo: params.motivo },
      })
      .pipe(catchError(this._handleError));
  }

  // ── Ranking ────────────────────────────────────────────────────────────────

  /**
   * Obtiene el top N de donantes por monto total confirmado.
   * GET /api/donaciones/ranking/top?limite=...
   */
  obtenerTopDonantes(limite = 10): Observable<RankingDonante[]> {
    return this.http
      .get<RankingDonanteResponseDTO[]>(`${this.baseUrl}/ranking/top`, {
        params: { limite: String(limite) },
      })
      .pipe(
        map(dtos => dtos.map(toRankingDonanteDomain)),
        catchError(this._handleError),
      );
  }

  /**
   * Obtiene las estadísticas de donación de un usuario específico.
   * GET /api/donaciones/ranking/usuario/:usuarioId
   */
  obtenerEstadisticasDonante(usuarioId: number): Observable<EstadisticasDonante> {
    return this.http
      .get<EstadisticasDonanteResponseDTO>(`${this.baseUrl}/ranking/usuario/${usuarioId}`)
      .pipe(
        map(toEstadisticasDomain),
        catchError(this._handleError),
      );
  }

  // ── Manejo de errores ──────────────────────────────────────────────────────

  private _handleError(error: HttpErrorResponse): Observable<never> {
    let msg: string;

    switch (error.status) {
      case 0:
        msg = 'Error de conexión. Verifica tu red e intenta nuevamente.';
        break;
      case 400:
        msg = error.error?.mensaje ?? 'Datos inválidos. Revisa el formulario.';
        break;
      case 401:
        msg = 'No autenticado. Por favor inicia sesión.';
        break;
      case 403:
        msg = 'No tienes permisos para realizar esta acción.';
        break;
      case 404:
        msg = 'Donación no encontrada.';
        break;
      case 409:
        msg = error.error?.mensaje ?? 'Ya tienes una donación pendiente. Espera a que sea confirmada.';
        break;
      default:
        msg = `Error inesperado (${error.status}). Intenta más tarde.`;
    }

    return throwError(() => new Error(msg));
  }
}