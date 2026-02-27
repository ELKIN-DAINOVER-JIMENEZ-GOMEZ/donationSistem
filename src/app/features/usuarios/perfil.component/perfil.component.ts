import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../environments/environment';

export interface UsuarioPerfil {
  id: number;
  nombre: string;
  email: string;
  rol: 'DONANTE' | 'LIDER_SOCIAL' | 'ADMINISTRADOR';
  activo: boolean;
  fechaRegistro?: string;
  totalDonado?: number;
  cantidadDonaciones?: number;
  posicionRanking?: number;
}

export interface DonacionPendiente {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  emailUsuario: string;
  tipo: string;
  monto?: number;
  descripcion: string;
  detalleEspecies?: string;
  estado: string;
  fechaDonacion: string;
}

type Tab = 'perfil' | 'seguridad' | 'actividad' | 'peticiones';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  isLoading    = signal(true);
  isSaving     = signal(false);
  activeTab: Tab = 'perfil';
  successMessage = signal('');
  errorMessage   = signal('');

  usuario!: UsuarioPerfil;
  form!: Partial<UsuarioPerfil>;

  passForm = { actual: '', nueva: '', confirmar: '' };
  showPass = { actual: false, nueva: false, confirmar: false };
  isSavingPass = signal(false);

  // ── Peticiones pendientes ──────────────────────────────────────────────
  donacionesPendientes: DonacionPendiente[] = [];
  isLoadingPendientes = signal(false);
  procesandoId = signal<number | null>(null);
  motivoRechazo: { [id: number]: string } = {};
  mostrarRechazo: { [id: number]: boolean } = {};

  private http        = inject(HttpClient);
  private router      = inject(Router);
  private authService = inject(AuthService);

  private authHeaders(): HttpHeaders {
    const token = this.authService.token();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'X-Skip-Loading': 'true'
    });
  }

  // ── Getters ────────────────────────────────────────────────────────────
  get initials(): string {
    if (!this.usuario) return '?';
    const parts = this.usuario.nombre.trim().split(' ');
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
  }

  get rolLabel(): string {
    const map: Record<string, string> = {
      ADMINISTRADOR: '🛡️ Administrador',
      LIDER_SOCIAL:  '🌟 Líder Social',
      DONANTE:       '❤️ Donante',
    };
    return map[this.usuario?.rol] ?? this.usuario?.rol;
  }

  get rolBadgeClass(): string {
    const map: Record<string, string> = {
      ADMINISTRADOR: 'badge-admin',
      LIDER_SOCIAL:  'badge-lider',
      DONANTE:       'badge-donante',
    };
    return map[this.usuario?.rol] ?? '';
  }

  get passwordStrength(): { score: number; label: string; cls: string } {
    const p = this.passForm.nueva;
    if (!p) return { score: 0, label: '', cls: '' };
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p))   score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    const map = [
      { label: '',           cls: ''          },
      { label: 'Muy débil',  cls: 'str-weak'  },
      { label: 'Débil',      cls: 'str-fair'  },
      { label: 'Media',      cls: 'str-good'  },
      { label: 'Fuerte',     cls: 'str-strong'},
      { label: 'Muy fuerte', cls: 'str-strong'},
    ];
    return { score, ...map[score] };
  }

  get passwordsMatch(): boolean {
    return this.passForm.nueva === this.passForm.confirmar
      && this.passForm.confirmar.length > 0;
  }

  get esLiderSocial(): boolean {
    return this.usuario?.rol === 'LIDER_SOCIAL';
  }

  formatMonto(n: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(n);
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  formatFechaCorta(f: string): string {
    return new Date(f).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  setTab(tab: Tab) {
    this.activeTab      = tab;
    this.successMessage.set('');
    this.errorMessage.set('');
    if (tab === 'peticiones') {
      this.cargarPendientes();
    }
  }

  // ── Cargar datos del perfil ────────────────────────────────────────────
  ngOnInit() {
    const token  = this.authService.token();
    const sesion = this.authService.usuario();

    if (!token || !sesion) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/usuarios/perfil' } });
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Skip-Loading': 'true'
    });

    this.http
      .get<UsuarioPerfil>(`${environment.apiUrl}/usuarios/${sesion.userId}`, { headers })
      .subscribe({
        next: (data) => {
          this.usuario   = data;
          this.form      = { ...data };
          this.isLoading.set(false);
        },
        error: (err) => {
          if (err.status === 401) { this.authService.logout(); return; }
          this.errorMessage.set(err.error?.message || 'No se pudo cargar el perfil.');
          this.isLoading.set(false);
        }
      });
  }

  // ── Cargar donaciones pendientes ───────────────────────────────────────
  cargarPendientes() {
  this.isLoadingPendientes.set(true);
  console.log('📋 Cargando pendientes...');

  this.http
    .get<DonacionPendiente[]>(
      `${environment.apiUrl}/donaciones/estado/PENDIENTE`,
      { headers: this.authHeaders() }
    )
    .subscribe({
      next: (data) => {
        console.log('✅ Pendientes recibidas:', data.length, data);
        this.donacionesPendientes = data;
        this.isLoadingPendientes.set(false);
      },
      error: (err) => {
        console.error('❌ Error status:', err.status, err);
        this.errorMessage.set(err.error?.mensaje ?? `Error ${err.status} cargando pendientes.`);
        this.isLoadingPendientes.set(false);
      }
    });
}

  // ── Confirmar donación ─────────────────────────────────────────────────
  confirmarDonacion(id: number) {
    this.procesandoId.set(id);
    this.http
      .patch<void>(
        `${environment.apiUrl}/donaciones/${id}/confirmar`,
        null,
        { headers: this.authHeaders() }
      )
      .subscribe({
        next: () => {
          this.donacionesPendientes = this.donacionesPendientes.filter(d => d.id !== id);
          this.procesandoId.set(null);
          this.successMessage.set('Donación confirmada correctamente.');
          setTimeout(() => this.successMessage.set(''), 3500);
        },
        error: (err) => {
          this.procesandoId.set(null);
          this.errorMessage.set(err.error?.mensaje ?? 'Error al confirmar la donación.');
        }
      });
  }

  // ── Rechazar donación ──────────────────────────────────────────────────
  toggleRechazo(id: number) {
    this.mostrarRechazo[id] = !this.mostrarRechazo[id];
    if (!this.motivoRechazo[id]) this.motivoRechazo[id] = '';
  }

  rechazarDonacion(id: number) {
    const motivo = this.motivoRechazo[id]?.trim();
    if (!motivo) {
      this.errorMessage.set('Debes ingresar un motivo de rechazo.');
      return;
    }
    this.procesandoId.set(id);
    this.http
      .patch<void>(
        `${environment.apiUrl}/donaciones/${id}/rechazar`,
        null,
        {
          headers: this.authHeaders(),
          params: { motivo }
        }
      )
      .subscribe({
        next: () => {
          this.donacionesPendientes = this.donacionesPendientes.filter(d => d.id !== id);
          delete this.mostrarRechazo[id];
          delete this.motivoRechazo[id];
          this.procesandoId.set(null);
          this.successMessage.set('Donación rechazada.');
          setTimeout(() => this.successMessage.set(''), 3500);
        },
        error: (err) => {
          this.procesandoId.set(null);
          this.errorMessage.set(err.error?.mensaje ?? 'Error al rechazar la donación.');
        }
      });
  }

  // ── Guardar perfil ─────────────────────────────────────────────────────
  onSavePerfil() {
    this.errorMessage.set('');
    if (!this.form.nombre?.trim() || !this.form.email?.trim()) {
      this.errorMessage.set('Nombre y correo son obligatorios.');
      return;
    }
    this.isSaving.set(true);
    this.http
      .put<UsuarioPerfil>(
        `${environment.apiUrl}/usuarios/${this.usuario.id}`,
        { nombre: this.form.nombre, email: this.form.email },
        { headers: this.authHeaders() }
      )
      .subscribe({
        next: (updated) => {
          this.usuario        = updated;
          this.form           = { ...updated };
          this.isSaving.set(false);
          this.successMessage.set('Perfil actualizado correctamente.');
          setTimeout(() => this.successMessage.set(''), 3500);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err.error?.mensaje ?? 'Error al guardar.');
        }
      });
  }

  // ── Cambiar contraseña ─────────────────────────────────────────────────
  onSavePassword() {
    this.errorMessage.set('');
    if (!this.passForm.actual)          { this.errorMessage.set('Ingresa tu contraseña actual.'); return; }
    if (this.passForm.nueva.length < 8) { this.errorMessage.set('Mínimo 8 caracteres.'); return; }
    if (!this.passwordsMatch)           { this.errorMessage.set('Las contraseñas no coinciden.'); return; }

    this.isSavingPass.set(true);
    this.http
      .patch(
        `${environment.apiUrl}/auth/cambiar-password`,
        { passwordActual: this.passForm.actual, passwordNueva: this.passForm.nueva },
        { headers: this.authHeaders() }
      )
      .subscribe({
        next: () => {
          this.isSavingPass.set(false);
          this.passForm       = { actual: '', nueva: '', confirmar: '' };
          this.successMessage.set('Contraseña actualizada.');
          setTimeout(() => this.successMessage.set(''), 3500);
        },
        error: (err) => {
          this.isSavingPass.set(false);
          this.errorMessage.set(err.error?.mensaje ?? 'Error al cambiar la contraseña.');
        }
      });
  }
}