// src/app/app.config.ts
import { ApplicationConfig, Provider } from '@angular/core'; // Asegúrate de importar 'Provider'
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environments';

import { routes } from './app.routes';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es-ES');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'es-ES' }
  ]
};