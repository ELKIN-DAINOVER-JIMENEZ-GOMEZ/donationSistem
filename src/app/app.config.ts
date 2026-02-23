import { ApplicationConfig, provideZonelessChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withFetch
} from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes }             from './app.routes';
import { jwtInterceptor }     from './core/interceptors/jwt.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor }   from './core/interceptors/error.interceptor';

// Registrar datos del locale español (necesario para | date, | currency, etc.)
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        loadingInterceptor,
        jwtInterceptor,
        errorInterceptor,
      ])
    ),
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};