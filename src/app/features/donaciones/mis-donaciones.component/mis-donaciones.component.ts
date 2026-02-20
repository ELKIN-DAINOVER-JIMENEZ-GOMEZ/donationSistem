import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface Donacion {
  id: number;
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
  styleUrls: ['./mis-donaciones.component.css']
})
export class MisDonacionesComponent implements OnInit {

  isLoading = true;
  donaciones: Donacion[] = [];
  filtroEstado: FiltroEstado = 'TODOS';
  filtroTipo: FiltroTipo = 'TODOS';
  busqueda = '';
  expandedId: number | null = null;

  // Stats
  get totalDonado(): number {
    return this.donaciones
      .filter(d => d.estado === 'CONFIRMADA' && d.tipo === 'MONETARIA')
      .reduce((acc, d) => acc + (d.monto || 0), 0);
  }
  get totalConfirmadas(): number { return this.donaciones.filter(d => d.estado === 'CONFIRMADA').length; }
  get totalPendientes():  number { return this.donaciones.filter(d => d.estado === 'PENDIENTE').length; }

  get donacionesFiltradas(): Donacion[] {
    return this.donaciones.filter(d => {
      const matchEstado  = this.filtroEstado === 'TODOS' || d.estado === this.filtroEstado;
      const matchTipo    = this.filtroTipo   === 'TODOS' || d.tipo   === this.filtroTipo;
      const matchBusqueda = !this.busqueda   ||
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

  ngOnInit() {
    // TODO: GET /api/donaciones/usuario/{usuarioId}
    setTimeout(() => {
      this.donaciones = MOCK_DONACIONES;
      this.isLoading = false;
    }, 900);
  }
}

const MOCK_DONACIONES: Donacion[] = [
  {
    id: 1,
    tipo: 'MONETARIA',
    estado: 'CONFIRMADA',
    monto: 50000,
    descripcion: 'Apoyo para kit de útiles escolares',
    comprobante: 'https://drive.google.com/comprobante1',
    fechaDonacion: '2026-02-10T09:30:00',
    fechaConfirmacion: '2026-02-11T14:00:00',
    notas: 'Donación verificada correctamente. ¡Gracias por tu apoyo!'
  },
  {
    id: 2,
    tipo: 'MONETARIA',
    estado: 'PENDIENTE',
    monto: 120000,
    descripcion: 'Ayuda para mercado básico familiar',
    fechaDonacion: '2026-02-18T16:45:00'
  },
  {
    id: 3,
    tipo: 'ESPECIES',
    estado: 'CONFIRMADA',
    descripcion: 'Ropa para temporada escolar',
    detalleEspecies: '25 uniformes escolares talla 30-34, 10 pares de zapatos colegiales',
    fechaDonacion: '2026-01-28T11:20:00',
    fechaConfirmacion: '2026-01-30T09:00:00'
  },
  {
    id: 4,
    tipo: 'SERVICIOS',
    estado: 'PENDIENTE',
    descripcion: 'Clases de matemáticas para niños de primaria',
    fechaDonacion: '2026-02-15T08:00:00'
  },
  {
    id: 5,
    tipo: 'MONETARIA',
    estado: 'RECHAZADA',
    monto: 30000,
    descripcion: 'Apoyo para medicamentos',
    comprobante: 'https://drive.google.com/comprobante5',
    fechaDonacion: '2026-02-01T10:00:00',
    notas: 'Comprobante no coincide con el monto indicado. Por favor vuelve a intentarlo con el comprobante correcto.'
  }
];