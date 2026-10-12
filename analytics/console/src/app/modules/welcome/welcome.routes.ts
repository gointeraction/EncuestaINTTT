import { Routes } from '@angular/router';

/** Rutas del hub de bienvenida (elige área según rol/entorno). */
export const WELCOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/welcome/welcome.page').then((m) => m.WelcomePage),
  },
];
