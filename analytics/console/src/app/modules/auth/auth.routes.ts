import { Routes } from '@angular/router';

/** Rutas locales del módulo `auth` (páginas de acceso, sin sesión). */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
];
