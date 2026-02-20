import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface RankingDonante {
  posicion: number;
  usuarioId: number;
  nombre: string;
  email: string;
  totalDonado: number;
  cantidadDonaciones: number;
  promedioDonacion: number;
  tendencia?: 'up' | 'down' | 'same';
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {

  isLoading = true;
  ranking: RankingDonante[] = [];
  limite = 10;

  get top3(): RankingDonante[]  { return this.ranking.slice(0, 3); }
  get resto(): RankingDonante[] { return this.ranking.slice(3); }

  get totalRecaudado(): number {
    return this.ranking.reduce((s, d) => s + d.totalDonado, 0);
  }
  get totalDonaciones(): number {
    return this.ranking.reduce((s, d) => s + d.cantidadDonaciones, 0);
  }

  formatMonto(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  }

  formatMontoFull(n: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(n);
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }

  getMedalColor(pos: number): string {
    return pos === 1 ? '#f59e0b' : pos === 2 ? '#94a3b8' : '#cd7c2f';
  }

  getMedalLabel(pos: number): string {
    return pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉';
  }

  getBarWidth(monto: number): number {
    const max = this.ranking[0]?.totalDonado || 1;
    return Math.round((monto / max) * 100);
  }

  changeLimit(n: number) {
    this.limite = n;
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    // TODO: GET /api/donaciones/ranking/top?limite={{ limite }}
    setTimeout(() => {
      this.ranking = MOCK_RANKING.slice(0, this.limite);
      this.isLoading = false;
    }, 800);
  }

  ngOnInit() { this.loadData(); }
}

const MOCK_RANKING: RankingDonante[] = [
  { posicion: 1, usuarioId: 5,  nombre: 'María González',  email: 'maria@example.com',   totalDonado: 850000, cantidadDonaciones: 12, promedioDonacion: 70833, tendencia: 'up'   },
  { posicion: 2, usuarioId: 8,  nombre: 'Carlos Rodríguez',email: 'carlos@example.com',  totalDonado: 620000, cantidadDonaciones: 8,  promedioDonacion: 77500, tendencia: 'up'   },
  { posicion: 3, usuarioId: 3,  nombre: 'Ana Martínez',    email: 'ana@example.com',     totalDonado: 480000, cantidadDonaciones: 15, promedioDonacion: 32000, tendencia: 'down' },
  { posicion: 4, usuarioId: 12, nombre: 'Luis Herrera',    email: 'luis@example.com',    totalDonado: 350000, cantidadDonaciones: 7,  promedioDonacion: 50000, tendencia: 'same' },
  { posicion: 5, usuarioId: 7,  nombre: 'Sandra López',    email: 'sandra@example.com',  totalDonado: 280000, cantidadDonaciones: 10, promedioDonacion: 28000, tendencia: 'up'   },
  { posicion: 6, usuarioId: 2,  nombre: 'Jorge Ramírez',   email: 'jorge@example.com',   totalDonado: 220000, cantidadDonaciones: 5,  promedioDonacion: 44000, tendencia: 'up'   },
  { posicion: 7, usuarioId: 15, nombre: 'Paula Jiménez',   email: 'paula@example.com',   totalDonado: 190000, cantidadDonaciones: 6,  promedioDonacion: 31666, tendencia: 'down' },
  { posicion: 8, usuarioId: 9,  nombre: 'Roberto Castro',  email: 'roberto@example.com', totalDonado: 155000, cantidadDonaciones: 4,  promedioDonacion: 38750, tendencia: 'same' },
  { posicion: 9, usuarioId: 11, nombre: 'Claudia Torres',  email: 'claudia@example.com', totalDonado: 120000, cantidadDonaciones: 9,  promedioDonacion: 13333, tendencia: 'up'   },
  { posicion: 10,usuarioId: 4,  nombre: 'Andrés Morales',  email: 'andres@example.com',  totalDonado: 90000,  cantidadDonaciones: 3,  promedioDonacion: 30000, tendencia: 'down' },
];