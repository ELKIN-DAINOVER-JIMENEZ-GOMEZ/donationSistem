import { Component, OnInit, inject, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../environments/environment';


export interface Donacion {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  emailUsuario: string;
  tipo: 'MONETARIA' | 'ESPECIES' | 'SERVICIOS';
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';
  monto?: number;
  descripcion: string;
  detalleEspecies?: string;
  comprobante?: string;
  fechaDonacion: string;
  fechaConfirmacion?: string;
  notas?: string;
}

type FiltroEstado = 'TODOS' | 'PENDIENTE' | 'CONFIRMADA' | 'RECHAZADA';
type FiltroTipo   = 'TODOS' | 'MONETARIA' | 'ESPECIES' | 'SERVICIOS';

@Component({
  selector: 'app-mis-donaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-donaciones.component.html',
  styleUrls: ['./mis-donaciones.component.css'],
  encapsulation: ViewEncapsulation.None   // ← CLAVE: permite que body.light-mode funcione
})
export class MisDonacionesComponent implements OnInit {

  isLoading = true;
  errorMessage = '';
  donaciones: Donacion[] = [];
  filtroEstado: FiltroEstado = 'TODOS';
  filtroTipo: FiltroTipo = 'TODOS';
  busqueda = '';
  expandedId: number | null = null;

  private http        = inject(HttpClient);
  private authService = inject(AuthService);
  private cdr         = inject(ChangeDetectorRef);

  private authHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-Skip-Loading': 'true'
    });
  }

  // ── Stats ──────────────────────────────────────────────────────────────
  get totalDonado(): number {
    return this.donaciones
      .filter(d => d.estado === 'CONFIRMADA' && d.tipo === 'MONETARIA')
      .reduce((acc, d) => acc + (d.monto || 0), 0);
  }
  get totalConfirmadas(): number { return this.donaciones.filter(d => d.estado === 'CONFIRMADA').length; }
  get totalPendientes():  number { return this.donaciones.filter(d => d.estado === 'PENDIENTE').length; }

  get donacionesFiltradas(): Donacion[] {
    return this.donaciones.filter(d => {
      const matchEstado   = this.filtroEstado === 'TODOS' || d.estado === this.filtroEstado;
      const matchTipo     = this.filtroTipo   === 'TODOS' || d.tipo   === this.filtroTipo;
      const matchBusqueda = !this.busqueda    ||
        d.descripcion.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        (d.detalleEspecies || '').toLowerCase().includes(this.busqueda.toLowerCase());
      return matchEstado && matchTipo && matchBusqueda;
    });
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  formatMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(monto);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  // ── Cargar mis donaciones desde el API ─────────────────────────────────
  ngOnInit() {
    this.http
      .get<Donacion[]>(
        `${environment.apiUrl}/donaciones/mis-donaciones`,
        { headers: this.authHeaders() }
      )
      .subscribe({
        next: (data) => {
          this.donaciones = data;
          this.isLoading  = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.status === 401
            ? 'No autorizado. Por favor inicia sesión.'
            : err.error?.mensaje ?? 'No se pudieron cargar tus donaciones.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}