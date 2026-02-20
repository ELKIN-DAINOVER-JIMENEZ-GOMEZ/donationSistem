import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData = {
    email: '',
    password: '',
    remember: false
  };

  showPassword = false;
  isLoading    = false;
  errorMessage = '';

  private authService        = inject(AuthService);
  private notificaciones     = inject(NotificacionService);
  private router             = inject(Router);
  private route              = inject(ActivatedRoute);

  constructor() {
    // Mostrar aviso si la sesión expiró
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired']) {
        this.errorMessage = 'Tu sesión expiró. Por favor inicia sesión nuevamente.';
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      this.errorMessage = 'Ingresa un correo electrónico válido.';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      email:    this.loginData.email,
      password: this.loginData.password,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        // Redirigir a la URL original o al dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
        this.notificaciones.exito('¡Bienvenido!', `Hola de nuevo.`);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
      }
    });
  }
}