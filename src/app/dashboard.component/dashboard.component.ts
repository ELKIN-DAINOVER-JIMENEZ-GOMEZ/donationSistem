import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar.components/navbar.components';

interface Stat {
  value: string;
  label: string;
  icon: string;
  gradient: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  stats: Stat[] = [
    {
      value: '$2.5M+',
      label: 'Donaciones Recaudadas',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      value: '15,000+',
      label: 'Familias Ayudadas',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      value: '500+',
      label: 'Voluntarios Activos',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      gradient: 'from-rose-500 to-red-600'
    },
    {
      value: '50+',
      label: 'Comunidades Impactadas',
      icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-blue-500 to-cyan-600'
    }
  ];

  features: Feature[] = [
    {
      title: 'Donaciones Transparentes',
      description: 'Rastrea cada peso donado y ve el impacto directo en las comunidades.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Impacto en Tiempo Real',
      description: 'Observa cómo tus contribuciones transforman vidas instantáneamente.',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      gradient: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Comunidad Unida',
      description: 'Únete a miles de personas comprometidas con el cambio social.',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'María González',
      role: 'Líder Social',
      content: 'DonaVida ha transformado nuestra capacidad de ayudar a las familias más necesitadas. La plataforma es increíblemente fácil de usar.',
      avatar: 'MG'
    },
    {
      name: 'Carlos Mendoza',
      role: 'Donante Regular',
      content: 'Me encanta poder ver exactamente dónde va mi dinero. La transparencia es total y el impacto es real.',
      avatar: 'CM'
    },
    {
      name: 'Ana Rodríguez',
      role: 'Voluntaria',
      content: 'Ser parte de esta comunidad me ha dado un propósito. Juntos estamos cambiando vidas.',
      avatar: 'AR'
    }
  ];

  ngOnInit(): void { // Inicia las animaciones de los contadores al cargar el componente
    this.startCounterAnimations();
  }

  startCounterAnimations(): void {// Simulación de animación de conteo
    // Animación simple de aparición
    setTimeout(() => {
      const elements = document.querySelectorAll('.animate-fade-in');
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 100);
      });
    }, 100);
  }

  scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
}