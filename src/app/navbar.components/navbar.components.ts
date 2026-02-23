import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.components.html',
  styleUrls: ['./navbar.components.css']
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isMobileMenuOpen = false;
  isLightMode = false;

  ngOnInit(): void {
    const saved = localStorage.getItem('donavida_theme');
    if (saved === 'light') {
      this.isLightMode = true;
      document.body.classList.add('light-mode'); // ← CORRECCIÓN: body, no html
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    if (this.isLightMode) {
      document.body.classList.add('light-mode'); // ← CORRECCIÓN: body, no html
      localStorage.setItem('donavida_theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('donavida_theme', 'dark');
    }
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.isMobileMenuOpen = false;
    }
  }
}