import { Routes } from '@angular/router';
import { ConsoleLayout } from './shared/layouts/console/console.layout';
import { TestDataLayout } from './shared/layouts/test-data/test-data.layout';
import { sessionGuard } from './core/session.guard';
import { devOnlyGuard } from './core/dev-only.guard';

/**
 * Rutas raíz de la consola. Cada área ata el LAYOUT (eager, `component:`) a un grupo
 * LAZY de páginas (`loadChildren`): el layout renderiza el único `<router-outlet>` y
 * las páginas de cada módulo se incrustan dentro (page ocupa el display).
 * El área `auth` es pública (acceso + bienvenida); el área analítica exige sesión;
 * el área `test-data` es SOLO development (devOnlyGuard).
 */
export const routes: Routes = [
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: ConsoleLayout,
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'test-data',
    component: TestDataLayout,
    canActivate: [sessionGuard, devOnlyGuard],
    loadChildren: () => import('./modules/test-data/test-data.routes').then((m) => m.TEST_DATA_ROUTES),
  },
  {
    path: '',
    component: ConsoleLayout,
    canActivate: [sessionGuard],
    loadChildren: () => import('./modules/analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
