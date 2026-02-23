import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

export type TipoDonacionPeticion = 'MONETARIA' | 'ESPECIES' | 'SERVICIOS';

export interface Peticion {
  id: number;
  titulo: string;
  descripcion: string;
  tipoDonacion: TipoDonacionPeticion;
  imagenUrl: string | null;
  autorNombre: string;
  autorOrganizacion: string;
  fechaPublicacion: string;
}

const STORAGE_KEY = 'donavida_peticiones';

@Component({
  selector: 'app-realizar-peticion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './realizar-peticion.component.html',
  styleUrls: ['./realizar-peticion.component.css']
})
export class RealizarPeticionComponent {

  isLoading  = false;
  isSuccess  = false;
  errorMessage = '';
  imagenPreview: string | null = null;

  form = {
    titulo: '',
    descripcion: '',
    tipoDonacion: '' as TipoDonacionPeticion | '',
    imagenUrl: null as string | null
  };

  tiposDonacion = [
    { value: 'MONETARIA'  as TipoDonacionPeticion, label: 'Monetaria',   desc: 'Solicitar apoyo económico en dinero',              icon: 'money',     color: '#10b981' },
    { value: 'ESPECIES'   as TipoDonacionPeticion, label: 'En Especies', desc: 'Solicitar bienes, alimentos, ropa u objetos',      icon: 'box',       color: '#f59e0b' },
    { value: 'SERVICIOS'  as TipoDonacionPeticion, label: 'Servicios',   desc: 'Solicitar voluntarios o ayuda profesional',        icon: 'handshake', color: '#3b82f6' }
  ];

  constructor(private router: Router) {}

  get isFormValid(): boolean {
    return (
      this.form.titulo.trim().length >= 5 &&
      this.form.descripcion.trim().length >= 10 &&
      this.form.tipoDonacion !== ''
    );
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Por favor selecciona un archivo de imagen válido.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
      this.form.imagenUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  eliminarImagen(): void {
    this.imagenPreview = null;
    this.form.imagenUrl = null;
  }

  publicar(): void {
    this.errorMessage = '';
    if (!this.isFormValid) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    this.isLoading = true;

    // Leer sesión del usuario
    let autorNombre = 'Líder Social';
    let autorOrganizacion = 'Organización';
    try {
      const sesion = JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
      if (sesion.nombre)       autorNombre       = sesion.nombre;
      if (sesion.organizacion) autorOrganizacion = sesion.organizacion;
    } catch { }

    const nueva: Peticion = {
      id:                Date.now(),
      titulo:            this.form.titulo.trim(),
      descripcion:       this.form.descripcion.trim(),
      tipoDonacion:      this.form.tipoDonacion as TipoDonacionPeticion,
      imagenUrl:         this.form.imagenUrl,
      autorNombre,
      autorOrganizacion,
      fechaPublicacion:  new Date().toISOString()
    };

    // Guardar directo en localStorage
    try {
      const actuales: Peticion[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      actuales.unshift(nueva);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actuales));
    } catch { }

    setTimeout(() => {
      this.isLoading = false;
      this.isSuccess = true;
    }, 1000);
  }

  irAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  volver(): void {
    this.router.navigate(['/perfil']);
  }
}