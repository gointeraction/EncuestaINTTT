import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsNavComponent, type DsNavItem } from '@cifraflow/design';

/** Layout section (header, right): menu del área de ANALÍTICA (solo su dominio). */
@Component({
  selector: 'app-console-nav-section',
  standalone: true,
  imports: [DsNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ds-nav
      name="console"
      [items]="items"
      variant="underline"
      textColor="var(--ds-color-white)"
      activeColor="var(--ds-color-brand-accent)"
    />
  `,
})
export class ConsoleNavSection {
  protected readonly items: DsNavItem[] = [
    { label: 'Inicio', route: '/bienvenida' },
    { label: 'Global', route: '/analitica' },
    { label: 'Preguntas', route: '/analitica/preguntas' },
    { label: 'Panel', route: '/analitica/panel' },
    { label: 'Cruzados', route: '/analitica/reportes-cruzados' },
    { label: 'Anomalías', route: '/analitica/anomalias' },
    { label: 'Participantes', route: '/analitica/participantes' },
    { label: 'Encuestas', route: '/analitica/encuestas' },
    { label: 'Exportar', route: '/analitica/exportar' },
  ];
}
