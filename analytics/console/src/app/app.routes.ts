import { Routes } from '@angular/router';
import { ConsoleLayout } from './shared/layouts/console/console.layout';
import { sessionGuard } from './core/session.guard';

/**
 * Rutas raíz de la consola. Cada área ata el LAYOUT (eager, `component:`) a un grupo
 * LAZY de páginas (`loadChildren`): el layout renderiza el único `<router-outlet>` y
 * las páginas de cada módulo se incrustan dentro (page ocupa el display).
 * El área `auth` es pública (acceso + bienvenida); el área analítica exige sesión.
 */
export const routes: Routes = [
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: ConsoleLayout,
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: ConsoleLayout,
    canActivate: [sessionGuard],
    loadChildren: () => import('./modules/analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
