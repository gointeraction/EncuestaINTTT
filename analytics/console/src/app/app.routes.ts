import { Routes } from '@angular/router';
import { ConsoleLayout } from './shared/layouts/console/console.layout';
import { AdminLayout } from './shared/layouts/admin/admin.layout';
import { TestDataLayout } from './shared/layouts/test-data/test-data.layout';
import { HubLayout } from './shared/layouts/hub/hub.layout';
import { sessionGuard } from './core/session.guard';
import { adminGuard } from './core/admin.guard';
import { devOnlyGuard } from './core/dev-only.guard';

/**
 * Rutas raíz: un ÁREA por dominio, cada una con su LAYOUT (eager, `component:`) y su
 * grupo LAZY de páginas (`loadChildren`). El layout renderiza el único `<router-outlet>`.
 *
 *   auth       (público)                    → acceso / registro / recuperación
 *   bienvenida (sesión)                      → hub que elige el área según rol/entorno
 *   analitica  (sesión)                      → consola de analítica (ConsoleLayout)
 *   admin      (sesión + rol admin)          → administración (AdminLayout)
 *   test-data  (sesión + development)        → datos de prueba (TestDataLayout)
 */
export const routes: Routes = [
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: ConsoleLayout,
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'bienvenida',
    component: HubLayout,
    canActivate: [sessionGuard],
    loadChildren: () => import('./modules/welcome/welcome.routes').then((m) => m.WELCOME_ROUTES),
  },
  {
    path: 'analitica',
    component: ConsoleLayout,
    canActivate: [sessionGuard],
    loadChildren: () => import('./modules/analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [sessionGuard, adminGuard],
    loadChildren: () => import('./modules/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'test-data',
    component: TestDataLayout,
    canActivate: [sessionGuard, devOnlyGuard],
    loadChildren: () => import('./modules/test-data/test-data.routes').then((m) => m.TEST_DATA_ROUTES),
  },
  { path: '', redirectTo: 'bienvenida', pathMatch: 'full' },
  { path: '**', redirectTo: 'bienvenida' },
];
