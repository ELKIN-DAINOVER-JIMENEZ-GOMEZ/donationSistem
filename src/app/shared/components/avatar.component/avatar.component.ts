import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getIniciales } from '../../../data/models/usuario.model';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
@Component({
  selector: 'app-avatar',
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  @Input() nombre  = '';
  @Input() apellido?: string;
  @Input() size: AvatarSize = 'md';
  @Input() imgUrl?: string;

  get initials(): string {
    return getIniciales({ nombre: this.nombre, apellido: this.apellido });
  }

  get fullName(): string {
    return [this.nombre, this.apellido].filter(Boolean).join(' ');
  }

  /** Color determinista según el nombre (siempre el mismo para el mismo usuario) */
  get colorIndex(): number {
    if (!this.nombre) return 0;
    return this.nombre.charCodeAt(0) % 6;
  }
}
