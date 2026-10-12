import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { apiBaseInterceptor } from './core/api-base.interceptor';
import { authErrorInterceptor } from './core/auth-error.interceptor';
import { EnvironmentService } from './core/environment.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiBaseInterceptor, authErrorInterceptor])),
    // Carga el entorno del back-office una vez al arrancar (gate dev-only de test-data).
    provideAppInitializer(() => inject(EnvironmentService).load()),
  ],
};
