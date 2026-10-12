import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DsNavComponent, type DsNavItem } from '@cifraflow/design';
import { SessionService } from '../../../../core/session.service';
import { EnvironmentService } from '../../../../core/environment.service';

/** Layout section (header, right): the console main menu (ds-nav). */
@Component({
  selector: 'app-console-nav-section',
  standalone: true,
  imports: [DsNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ds-nav
      name="console"
      [items]="items()"
      variant="underline"
      textColor="var(--ds-color-white)"
      activeColor="var(--ds-color-brand-accent)"
    />
  `,
})
export class ConsoleNavSection {
  private readonly session = inject(SessionService);
  private readonly env = inject(EnvironmentService);

  protected readonly items = computed<DsNavItem[]>(() => {
    const base: DsNavItem[] = [
      { label: 'Global', route: '/' },
      { label: 'Preguntas', route: '/preguntas' },
      { label: 'Panel', route: '/panel' },
      { label: 'Cruzados', route: '/reportes-cruzados' },
      { label: 'Anomalías', route: '/anomalias' },
      { label: 'Participantes', route: '/participantes' },
      { label: 'Exportar', route: '/exportar' },
    ];
    if (this.session.user()?.role === 'admin') {
      base.push({ label: 'Usuarios', route: '/usuarios' });
    }
    if (this.env.isDevelopment()) {
      base.push({ label: 'Datos de prueba', route: '/test-data' });
    }
    return base;
  });
}
