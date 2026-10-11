import { Routes } from '@angular/router';
import { sessionGuard } from './core/session.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./modules/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'panel',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./modules/analytics/panel-encuesta/panel-encuesta.component').then(
        (m) => m.PanelEncuestaComponent,
      ),
  },
  {
    path: 'reportes-cruzados',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./modules/analytics/reportes-cruzados/reportes-cruzados.component').then(
        (m) => m.ReportesCruzadosComponent,
      ),
  },
  {
    path: 'participantes',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./modules/analytics/participantes/participantes.component').then(
        (m) => m.ParticipantesComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
