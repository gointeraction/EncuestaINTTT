import { Injectable, computed, inject } from '@angular/core';
import { SessionService } from '../../../../../../core/session.service';
import { EnvironmentService } from '../../../../../../core/environment.service';
import { ActiveSurveyService } from '../../../../../../core/active-survey.service';
import type { WelcomeStateContract } from '../contracts/welcome.state.contract';
import type { Destination } from '../models/welcome.model';

@Injectable()
export class WelcomeStateService implements WelcomeStateContract {
  private readonly session = inject(SessionService);
  private readonly env = inject(EnvironmentService);
  private readonly active = inject(ActiveSurveyService);

  readonly surveyTitle = computed(() => this.active.active()?.title ?? 'Visión Cero');

  constructor() {
    void this.active.load();
  }

  readonly destinations = computed<Destination[]>(() => {
    const user = this.session.user();
    const isAdmin = !!user && (user.role === 'admin' || user.permissions?.includes('*'));
    const out: Destination[] = [];

    if (isAdmin) {
      out.push({
        id: 'admin',
        label: 'Administración',
        description: 'Usuarios, solicitudes de registro y de cambio de contraseña.',
        route: '/admin',
        icon: 'users',
      });
      out.push({
        id: 'builder',
        label: 'Crear encuesta',
        description: 'Diseña una nueva encuesta y su cuestionario.',
        route: '/builder',
        icon: 'file-plus',
      });
    }
    out.push({
      id: 'analitica',
      label: 'Analítica',
      description: 'KPIs, panel por pregunta, cruces, anomalías y exportación.',
      route: '/analitica',
      icon: 'bar-chart-3',
    });
    if (this.env.isDevelopment()) {
      out.push({
        id: 'test-data',
        label: 'Datos de prueba',
        description: 'Seeder de datos (fixtures y volúmenes) — solo development.',
        route: '/test-data',
        icon: 'database',
      });
    }
    return out;
  });
}
