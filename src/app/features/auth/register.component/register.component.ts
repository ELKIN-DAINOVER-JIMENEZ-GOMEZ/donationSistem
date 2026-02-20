import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class registerComponent {

  registerData = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    organizacion: '',
    rol: 'DONANTE' as 'DONANTE' | 'LIDER_SOCIAL',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  showPassword = false;
  showConfirm  = false;
  isLoading    = false;
  errorMessage = '';
  currentStep  = 1;
  totalSteps   = 2;

  private authService    = inject(AuthService);
  private notificaciones = inject(NotificacionService);
  private router         = inject(Router);

  roles = [
    { value: 'DONANTE',      label: 'Donante',      description: 'Quiero realizar donaciones y apoyar causas',    icon: 'heart'  },
    { value: 'LIDER_SOCIAL', label: 'Líder Social',  description: 'Represento una comunidad o proyecto social',   icon: 'users'  },
  ];

  benefits = [
    'Rastrea el impacto real de tus donaciones',
    'Conecta directamente con comunidades',
    'Reportes detallados de transparencia',
    'Acceso a ranking de donantes',
    'Notificaciones de confirmación al instante',
  ];

  testimonial = {
    text:     'DonaVida transformó la manera en que apoyamos a nuestra comunidad. Cada peso donado llega exactamente donde debe llegar.',
    author:   'María González',
    role:     'Líder Social, Fundación Esperanza',
    initials: 'MG',
  };

  get passwordStrength(): { score: number; label: string; color: string } {
    const p = this.registerData.password;
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p))   score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;

    if (score <= 1) return { score, label: 'Muy débil', color: 'strength-weak'   };
    if (score <= 2) return { score, label: 'Débil',     color: 'strength-fair'   };
    if (score <= 3) return { score, label: 'Media',     color: 'strength-good'   };
    return              { score, label: 'Fuerte',       color: 'strength-strong' };
  }

  get passwordsMatch(): boolean {
    return this.registerData.password === this.registerData.confirmPassword
      && this.registerData.confirmPassword.length > 0;
  }

  togglePassword(field: 'password' | 'confirm') {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirm = !this.showConfirm;
  }

  nextStep() {
    this.errorMessage = '';
    if (!this.registerData.nombre || !this.registerData.apellido || !this.registerData.email) {
      this.errorMessage = 'Por favor completa nombre, apellido y correo.';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Ingresa un correo electrónico válido.';
      return;
    }
    this.currentStep = 2;
  }

  prevStep() {
    this.currentStep = 1;
    this.errorMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.registerData.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (!this.passwordsMatch) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
    if (!this.registerData.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones.';
      return;
    }

    this.isLoading = true;

    const { confirmPassword, acceptTerms, ...payload } = this.registerData;

    this.authService.registrar(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificaciones.exito(
          '¡Cuenta creada!',
          'Ya puedes iniciar sesión con tus credenciales.'
        );
        this.router.navigate(['/login']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
      }
    });
  }
}