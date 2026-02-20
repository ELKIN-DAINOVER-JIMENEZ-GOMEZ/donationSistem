import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoDonacion, ESTADO_LABELS, ESTADO_BADGE_VARIANT } from '../../../data/models/donacion.model';
import { RolUsuario, ROL_LABELS, ROL_BADGE_VARIANT } from '../../../data/models/usuario.model';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize    = 'sm' | 'md';
@Component({
  selector: 'app-badge',
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
   @Input() variant: BadgeVariant = 'neutral';
  @Input() size: BadgeSize = 'md';
  @Input() showDot = false;
  @Input() estado?: EstadoDonacion;
  @Input() rol?: RolUsuario;

  get badgeClasses(): string[] {
    const v = this.estado
      ? ESTADO_BADGE_VARIANT[this.estado]
      : this.rol ? ROL_BADGE_VARIANT[this.rol] : this.variant;
    return [`badge-${v}`, `badge-${this.size}`];
  }
  get estadoLabel() { return this.estado ? ESTADO_LABELS[this.estado] : ''; }
  get rolLabel()    { return this.rol    ? ROL_LABELS[this.rol]        : ''; }
}


