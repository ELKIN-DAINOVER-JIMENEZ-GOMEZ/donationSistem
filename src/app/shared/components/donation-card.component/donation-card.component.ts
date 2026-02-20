import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Donacion, formatearMonto, puedeGestionarse, TIPO_LABELS } from '../../../data/models/donacion.model';
import { BadgeComponent } from '../badge.component/badge.component';
import { AvatarComponent } from '../avatar.component/avatar.component';
import { CopCurrencyPipe } from '../../pipes/cop-currency.pipe';
import { FechaLegiblePipe } from '../../pipes/fecha-legible.pipe';

@Component({
  selector: 'app-donation-card',
  imports: [CommonModule, BadgeComponent, AvatarComponent, CopCurrencyPipe, FechaLegiblePipe],
  templateUrl: './donation-card.component.html',
  styleUrl: './donation-card.component.css',
})
export class DonationCardComponent {
@Input({ required: true }) donacion!: Donacion;
  @Input() showActions = false;

  @Output() onConfirmar = new EventEmitter<number>();
  @Output() onRechazar  = new EventEmitter<number>();

  readonly puedeGestionarse = puedeGestionarse;

  get tipoLabel(): string {
    return TIPO_LABELS[this.donacion.tipo] ?? this.donacion.tipo;
  }
}
