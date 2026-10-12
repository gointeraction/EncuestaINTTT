import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsNavComponent, type DsNavItem } from '@cifraflow/design';

/** Menu del área CONSTRUCTOR de encuestas (solo su dominio). */
@Component({
  selector: 'app-builder-nav-section',
  standalone: true,
  imports: [DsNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ds-nav
      name="builder"
      [items]="items"
      variant="underline"
      textColor="var(--ds-color-white)"
      activeColor="var(--ds-color-brand-accent)"
    />
  `,
})
export class BuilderNavSection {
  protected readonly items: DsNavItem[] = [
    { label: 'Inicio', route: '/bienvenida' },
    { label: 'Constructor', route: '/builder' },
  ];
}
