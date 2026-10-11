import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsNavComponent, type DsNavItem } from '@cifraflow/design';

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
      [items]="items"
      variant="underline"
      textColor="var(--ds-color-white)"
      activeColor="var(--ds-color-brand-accent)"
    />
  `,
})
export class ConsoleNavSection {
  protected readonly items: DsNavItem[] = [
    { label: 'Global', route: '/' },
    { label: 'Panel', route: '/panel' },
    { label: 'Cruzados', route: '/reportes-cruzados' },
    { label: 'Participantes', route: '/participantes' },
  ];
}
