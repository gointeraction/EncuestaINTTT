import { Routes } from '@angular/router';

/** Rutas locales del módulo `auth` (páginas de acceso, sin sesión). */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
];
