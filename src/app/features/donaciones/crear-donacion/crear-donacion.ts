import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

type TipoDonacion = 'MONETARIA' | 'ESPECIES' | 'SERVICIOS';
type Step = 1 | 2 | 3;

interface DonacionForm {
  usuarioId: number;
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

  currentStep: Step = 1;
  totalSteps = 3;
  isLoading = false;
  isSuccess = false;
  errorMessage = '';

  form: DonacionForm = {
    usuarioId: 1, // TODO: obtener del AuthService
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

  ngOnInit() {}

  constructor(private router: Router) {}

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
    if (this.currentStep > 1) this.currentStep = (this.currentStep - 1) as Step;
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.isStepValid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos.';
      return;
    }

    this.isLoading = true;
    // TODO: conectar con POST /api/donaciones
    const payload = {
      usuarioId: this.form.usuarioId,
      tipo: this.form.tipo,
      monto: this.form.tipo === 'MONETARIA' ? this.form.monto : undefined,
      descripcion: this.form.descripcion,
      detalleEspecies: this.form.tipo === 'ESPECIES' ? this.form.detalleEspecies : undefined,
      comprobante: this.form.comprobante || undefined
    };

    console.log('POST /api/donaciones', payload);

    setTimeout(() => {
      this.isLoading = false;
      this.isSuccess = true;
    }, 1800);
  }

  goToDonaciones() {
    this.router.navigate(['/donaciones/mis-donaciones']);
  }
}