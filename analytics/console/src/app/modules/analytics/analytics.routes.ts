import { Routes } from '@angular/router';
import { sessionGuard } from '../../core/session.guard';

/** Rutas locales del módulo `analytics` (páginas de la consola, requieren sesión). */
export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [sessionGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/global/global.component').then((m) => m.GlobalComponent),
      },
      {
        path: 'panel',
        loadComponent: () =>
          import('./pages/panel-encuesta/panel-encuesta.component').then((m) => m.PanelEncuestaComponent),
      },
      {
        path: 'reportes-cruzados',
        loadComponent: () =>
          import('./pages/reportes-cruzados/reportes-cruzados.component').then((m) => m.ReportesCruzadosComponent),
      },
      {
        path: 'participantes',
        loadComponent: () =>
          import('./pages/participantes/participantes.component').then((m) => m.ParticipantesComponent),
      },
    ],
  },
];
