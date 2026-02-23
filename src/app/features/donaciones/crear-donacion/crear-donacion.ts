import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../environments/environment';

type TipoDonacion = 'MONETARIA' | 'ESPECIES' | 'SERVICIOS';
type Step = 1 | 2 | 3;

interface DonacionForm {
  tipo: TipoDonacion | '';
  monto: number | null;
  descripcion: string;
  detalleEspecies: string;
  comprobante: string;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-crear-donacion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './crear-donacion.html',
  styleUrls: ['./crear-donacion.css']
})
export class CrearDonacionComponent implements OnInit {

  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
  private http        = inject(HttpClient);
  private authService = inject(AuthService);

  currentStep: Step = 1;
  totalSteps = 3;
  isLoading = false;
  isSuccess = false;
  errorMessage = '';

  /**
   * true cuando el tipo llegó pre-seleccionado desde una petición.
   * Oculta el paso 1 y muestra un badge informativo en su lugar.
   */
  tipoPreseleccionado = false;

  form: DonacionForm = {
    tipo: '',
    monto: null,
    descripcion: '',
    detalleEspecies: '',
    comprobante: '',
    acceptTerms: false
  };

  montosSugeridos = [10000, 25000, 50000, 100000, 250000];
  montoPersonalizado = false;

  tiposDonacion = [
    {
      value: 'MONETARIA' as TipoDonacion,
      label: 'Monetaria',
      desc: 'Transfiere un monto en dinero directamente a la causa',
      icon: 'money',
      color: '#10b981'
    },
    {
      value: 'ESPECIES' as TipoDonacion,
      label: 'En Especies',
      desc: 'Dona ropa, alimentos, materiales u otros bienes',
      icon: 'box',
      color: '#f59e0b'
    },
    {
      value: 'SERVICIOS' as TipoDonacion,
      label: 'Servicios',
      desc: 'Ofrece tu tiempo y habilidades profesionales',
      icon: 'handshake',
      color: '#3b82f6'
    }
  ];

  impactoEjemplos = [
    { monto: 10000,  impacto: 'Un kit de útiles escolares' },
    { monto: 25000,  impacto: 'Mercado básico para una familia' },
    { monto: 50000,  impacto: 'Medicamentos por un mes' },
    { monto: 100000, impacto: 'Libros para 5 estudiantes' },
    { monto: 250000, impacto: 'Uniformes para 10 niños' },
  ];

  // ── Getters computados ────────────────────────────────────────────────────

  get tipoActualMeta() {
    return this.tiposDonacion.find(t => t.value === this.form.tipo) ?? null;
  }

  get impactoActual(): string {
    if (!this.form.monto) return '';
    const ejemplo = this.impactoEjemplos.reduce((prev, curr) =>
      Math.abs(curr.monto - this.form.monto!) < Math.abs(prev.monto - this.form.monto!) ? curr : prev
    );
    return ejemplo.impacto;
  }

  get montoFormateado(): string {
    if (!this.form.monto) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(this.form.monto);
  }

  get isStepValid(): boolean {
    if (this.currentStep === 1) return !!this.form.tipo;
    if (this.currentStep === 2) {
      if (this.form.tipo === 'MONETARIA') return !!this.form.monto && this.form.monto >= 1000;
      if (this.form.tipo === 'ESPECIES')  return !!this.form.detalleEspecies.trim();
      if (this.form.tipo === 'SERVICIOS') return !!this.form.descripcion.trim();
      return false;
    }
    if (this.currentStep === 3) return !!this.form.descripcion.trim() && this.form.acceptTerms;
    return false;
  }

  // ── Ciclo de vida ─────────────────────────────────────────────────────────

  ngOnInit() {
    // Verificar sesión activa — si no hay, redirect a login
    const sesion = this.authService.usuario();
    if (!sesion) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    // Leer queryParams: tipo, peticion, autor
    this.route.queryParams.subscribe(params => {
      const tipo = params['tipo'] as TipoDonacion | undefined;
      if (tipo && ['MONETARIA', 'ESPECIES', 'SERVICIOS'].includes(tipo)) {
        this.form.tipo = tipo;
        this.tipoPreseleccionado = true;
        this.currentStep = 2;
      }
    });
  }

  // ── Acciones del formulario ───────────────────────────────────────────────

  selectTipo(tipo: TipoDonacion) {
    this.form.tipo = tipo;
  }

  selectMonto(monto: number) {
    this.form.monto = monto;
    this.montoPersonalizado = false;
  }

  activarMontoPersonalizado() {
    this.montoPersonalizado = true;
    this.form.monto = null;
  }

  nextStep() {
    this.errorMessage = '';
    if (!this.isStepValid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }
    if (this.currentStep < 3) this.currentStep = (this.currentStep + 1) as Step;
  }

  prevStep() {
    this.errorMessage = '';
    // Si el tipo vino preseleccionado no puede retroceder más allá del paso 2
    const minStep: Step = this.tipoPreseleccionado ? 2 : 1;
    if (this.currentStep > minStep) {
      this.currentStep = (this.currentStep - 1) as Step;
    }
  }

  // ── Submit real al backend ────────────────────────────────────────────────

  onSubmit() {
    this.errorMessage = '';
    if (!this.isStepValid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    const sesion = this.authService.usuario();
    if (!sesion) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;

    // Construir payload que espera DonacionRequestDTO.java
    const payload: Record<string, unknown> = {
      usuarioId:   sesion.userId,
      tipo:        this.form.tipo,
      descripcion: this.form.descripcion.trim()
    };

    if (this.form.tipo === 'MONETARIA' && this.form.monto) {
      payload['monto'] = this.form.monto;
    }
    if (this.form.tipo === 'ESPECIES' && this.form.detalleEspecies.trim()) {
      payload['detalleEspecies'] = this.form.detalleEspecies.trim();
    }
    if (this.form.comprobante.trim()) {
      payload['comprobante'] = this.form.comprobante.trim();
    }

    const token = this.authService.token();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json'
    });

    this.http
      .post(`${environment.apiUrl}/donaciones`, payload, { headers })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.isSuccess = true;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error?.mensaje ??
            err.error?.message ??
            (err.status === 409
              ? 'Ya tienes una donación pendiente. Espera a que sea confirmada.'
              : err.status === 401
                ? 'Tu sesión expiró. Por favor inicia sesión nuevamente.'
                : 'Ocurrió un error al registrar la donación. Intenta más tarde.');

          if (err.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  goToDonaciones() {
    this.router.navigate(['/donaciones/mis-donaciones']);
  }
}