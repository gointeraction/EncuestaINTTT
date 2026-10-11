import { Routes } from '@angular/router';

/** Rutas locales del módulo `analytics` (páginas de la consola). El guard de sesión
 *  lo aplica el área en `app.routes.ts`. */
export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/global/global.page').then((m) => m.GlobalPage),
  },
  {
    path: 'panel',
    loadComponent: () =>
      import('./pages/panel-encuesta/panel-encuesta.page').then((m) => m.PanelEncuestaPage),
  },
  {
    path: 'preguntas',
    loadComponent: () => import('./pages/preguntas/preguntas.page').then((m) => m.PreguntasPage),
  },
  {
    path: 'reportes-cruzados',
    loadComponent: () =>
      import('./pages/reportes-cruzados/reportes-cruzados.page').then((m) => m.ReportesCruzadosPage),
  },
  {
    path: 'participantes',
    loadComponent: () =>
      import('./pages/participantes/participantes.component').then((m) => m.ParticipantesComponent),
  },
  {
    path: 'datos',
    loadComponent: () => import('./pages/dev-seed/dev-seed.page').then((m) => m.DevSeedPage),
  },
];
