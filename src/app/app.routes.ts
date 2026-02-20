import { Routes } from '@angular/router';

export const routes: Routes = [
    // ── Ruta raíz → Dashboard principal ───────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component/dashboard.component')
        .then(m => m.DashboardComponent),
    title: 'DonaVida — Transforma Vidas con tus Donaciones',
  },

  // ── Autenticación ──────────────────────────────────────────────
  
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login.component/login.component')
            .then(m => m.LoginComponent),
        title: 'Iniciar Sesión — DonaVida',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register.component/register.component')
            .then(m => m.registerComponent),
        title: 'Crear Cuenta — DonaVida',
      },

      {
    path: 'donaciones',
    children: [
      {
        path: '',
        redirectTo: 'mis-donaciones',
        pathMatch: 'full'
      },
      {
        path: 'crear',
        loadComponent: () =>
          import('./features/donaciones/crear-donacion/crear-donacion').then(m => m.CrearDonacionComponent),
        title: 'Nueva donación — DonaVida'
      },
      {
        path: 'mis-donaciones',
        loadComponent: () =>
          import('./features/donaciones/mis-donaciones.component/mis-donaciones.component').then(m => m.MisDonacionesComponent),
        title: 'Mis donaciones — DonaVida'
      },
      {
        path: 'ranking',
        loadComponent: () =>
          import('./features/donaciones/ranking.component/ranking.component').then(m => m.RankingComponent),
        title: 'Ranking de donantes — DonaVida'
      },
    
    ]
  },
     // ── Usuarios ──────────────────────────────────────────────────────────
  {
    path: 'usuarios',
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/usuarios/perfil.component/perfil.component').then(m => m.PerfilComponent),
        title: 'miPerfil'
      }
    ]
  }
        
    ];
    
