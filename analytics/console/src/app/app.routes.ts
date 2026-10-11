import { Routes } from '@angular/router';

/**
 * Rutas raíz de la consola. Redirige cada módulo a su archivo de rutas LOCAL
 * (modules/<modulo>/<modulo>.routes.ts); cada módulo expone sus páginas, que se
 * despliegan dentro del layout (`app-console-layout`).
 */
export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./modules/analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
