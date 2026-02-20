import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface UsuarioPerfil {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  organizacion: string;
  rol: 'DONANTE' | 'LIDER_SOCIAL' | 'ADMINISTRADOR';
  activo: boolean;
  fechaRegistro: string;
  totalDonado?: number;
  cantidadDonaciones?: number;
  posicionRanking?: number;
}

type Tab = 'perfil' | 'seguridad' | 'actividad';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  isLoading = true;
  isSaving  = false;
  activeTab: Tab = 'perfil';
  successMessage = '';
  errorMessage = '';

  usuario!: UsuarioPerfil;
  form!: Partial<UsuarioPerfil>;

  // Seguridad
  passForm = { actual: '', nueva: '', confirmar: '' };
  showPass = { actual: false, nueva: false, confirmar: false };
  isSavingPass = false;

  get initials(): string {
    if (!this.usuario) return '?';
    return (this.usuario.nombre[0] + (this.usuario.apellido?.[0] || '')).toUpperCase();
  }

  get fullName(): string {
    if (!this.usuario) return '';
    return `${this.usuario.nombre} ${this.usuario.apellido}`.trim();
  }

  get rolLabel(): string {
    const map: Record<string, string> = {
      ADMINISTRADOR: '🛡️ Administrador',
      LIDER_SOCIAL: '🌟 Líder Social',
      DONANTE: '❤️ Donante'
    };
    return map[this.usuario?.rol] || this.usuario?.rol;
  }

  get rolBadgeClass(): string {
    const map: Record<string, string> = {
      ADMINISTRADOR: 'badge-admin',
      LIDER_SOCIAL: 'badge-lider',
      DONANTE: 'badge-donante'
    };
    return map[this.usuario?.rol] || '';
  }

  get passwordStrength(): { score: number; label: string; cls: string } {
    const p = this.passForm.nueva;
    if (!p) return { score: 0, label: '', cls: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    const map = [
      { label: '', cls: '' },
      { label: 'Muy débil', cls: 'str-weak' },
      { label: 'Débil', cls: 'str-fair' },
      { label: 'Media', cls: 'str-good' },
      { label: 'Fuerte', cls: 'str-strong' },
      { label: 'Muy fuerte', cls: 'str-strong' },
    ];
    return { score, ...map[score] };
  }

  get passwordsMatch(): boolean {
    return this.passForm.nueva === this.passForm.confirmar && this.passForm.confirmar.length > 0;
  }

  formatMonto(n: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(n);
  }

  formatFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSavePerfil() {
    this.errorMessage = '';
    if (!this.form.nombre?.trim() || !this.form.email?.trim()) {
      this.errorMessage = 'Nombre y correo son obligatorios.';
      return;
    }
    this.isSaving = true;
    // TODO: PUT /api/usuarios/{{ usuario.id }}
    const payload = {
      nombre: this.form.nombre,
      apellido: this.form.apellido,
      email: this.form.email,
      telefono: this.form.telefono,
      organizacion: this.form.organizacion,
    };
    console.log('PUT /api/usuarios/' + this.usuario.id, payload);
    setTimeout(() => {
      Object.assign(this.usuario, this.form);
      this.isSaving = false;
      this.successMessage = 'Perfil actualizado correctamente.';
      setTimeout(() => this.successMessage = '', 3500);
    }, 1200);
  }

  onSavePassword() {
    this.errorMessage = '';
    if (!this.passForm.actual) { this.errorMessage = 'Ingresa tu contraseña actual.'; return; }
    if (this.passForm.nueva.length < 8) { this.errorMessage = 'La nueva contraseña debe tener al menos 8 caracteres.'; return; }
    if (!this.passwordsMatch) { this.errorMessage = 'Las contraseñas no coinciden.'; return; }

    this.isSavingPass = true;
    // TODO: PATCH /api/auth/cambiar-password
    console.log('PATCH /api/auth/cambiar-password');
    setTimeout(() => {
      this.isSavingPass = false;
      this.passForm = { actual: '', nueva: '', confirmar: '' };
      this.successMessage = 'Contraseña actualizada correctamente.';
      setTimeout(() => this.successMessage = '', 3500);
    }, 1400);
  }

  ngOnInit() {
    // TODO: GET /api/usuarios/me  o  /api/usuarios/{{ userId del token }}
    setTimeout(() => {
      this.usuario = MOCK_USUARIO;
      this.form = { ...this.usuario };
      this.isLoading = false;
    }, 700);
  }
}

const MOCK_USUARIO: UsuarioPerfil = {
  id: 1,
  nombre: 'María',
  apellido: 'González',
  email: 'maria@example.com',
  telefono: '+57 300 123 4567',
  organizacion: 'Fundación Esperanza',
  rol: 'LIDER_SOCIAL',
  activo: true,
  fechaRegistro: '2025-06-15T00:00:00',
  totalDonado: 850000,
  cantidadDonaciones: 12,
  posicionRanking: 1,
};