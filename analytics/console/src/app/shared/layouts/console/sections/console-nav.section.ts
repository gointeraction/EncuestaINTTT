import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsContainerComponent, DsNavComponent, type DsNavItem } from '@cifraflow/design';

/** Layout section (nav): the console main menu (ds-nav, on the shell header). */
@Component({
  selector: 'app-console-nav-section',
  standalone: true,
  imports: [DsContainerComponent, DsNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    <ds-container kind="section" name="console-nav" class="flex items-center">
      <ds-nav
        name="console"
        [items]="items"
        variant="underline"
        textColor="var(--ds-color-white)"
        activeColor="var(--ds-color-brand-accent)"
      />
    </ds-container>
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
