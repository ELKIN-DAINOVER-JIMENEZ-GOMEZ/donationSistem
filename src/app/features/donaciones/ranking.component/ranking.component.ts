import { Component, OnInit, inject, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

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
  styleUrls: ['./ranking.component.css'],
  encapsulation: ViewEncapsulation.None  // ← permite que body.light-mode funcione
})
export class RankingComponent implements OnInit {

  isLoading    = true;
  errorMessage = '';
  ranking: RankingDonante[] = [];
  limite = 10;

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
    this.isLoading    = true;
    this.errorMessage = '';

    this.http
      .get<RankingDonante[]>(
        `${environment.apiUrl}/donaciones/ranking/top`,
        {
          params:  { limite: String(this.limite) },
          headers: this.authHeaders()
        }
      )
      .subscribe({
        next: (data) => {
          this.ranking   = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.status === 401
            ? 'No autorizado. Por favor inicia sesión.'
            : err.error?.mensaje ?? `Error ${err.status}: No se pudo cargar el ranking.`;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  ngOnInit() { this.loadData(); }
}