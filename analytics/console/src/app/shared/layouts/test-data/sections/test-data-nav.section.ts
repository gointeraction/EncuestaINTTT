import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsNavComponent, type DsNavItem } from '@cifraflow/design';

/** Menu propio del módulo test-data: volver a la consola + secciones del módulo. */
@Component({
  selector: 'app-test-data-nav-section',
  standalone: true,
  imports: [DsNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ds-nav
      name="test-data"
      [items]="items"
      variant="underline"
      textColor="var(--ds-color-white)"
      activeColor="var(--ds-color-brand-accent)"
    />
  `,
})
export class TestDataNavSection {
  protected readonly items: DsNavItem[] = [
    { label: 'Datos de prueba', route: '/test-data' },
    { label: 'Inicio', route: '/bienvenida' },
  ];
}
