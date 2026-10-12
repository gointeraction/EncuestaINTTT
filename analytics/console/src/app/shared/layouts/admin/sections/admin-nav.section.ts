import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsNavComponent, type DsNavItem } from '@cifraflow/design';

/** Menu del área de ADMINISTRACIÓN (solo funciones de su dominio). */
@Component({
  selector: 'app-admin-nav-section',
  standalone: true,
  imports: [DsNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ds-nav
      name="admin"
      [items]="items"
      variant="underline"
      textColor="var(--ds-color-white)"
      activeColor="var(--ds-color-brand-accent)"
    />
  `,
})
export class AdminNavSection {
  protected readonly items: DsNavItem[] = [
    { label: 'Inicio', route: '/bienvenida' },
    { label: 'Usuarios y solicitudes', route: '/admin' },
    { label: 'Dispositivos', route: '/admin/devices' },
  ];
}
