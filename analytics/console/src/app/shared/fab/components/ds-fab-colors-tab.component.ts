import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FabI18nService } from '../services/fab-i18n.service';

/** Un token de color: token CSS y valor resuelto en runtime. */
interface ColorToken {
  token: string;
  value: string;
}

/** Un rol dentro de una familia (p.ej. brand → primary, accent, secondary …). */
interface ColorRole {
  name: string;
  base: ColorToken;
  steps: { step: string; token: string; value: string }[];
}

interface ColorGroup {
  title: string;
  roles: ColorRole[];
}

/** Orden de roles por familia (colores UTILITARIOS — los de marca viven en el tab Brand). */
const DESIGN_ROLES = ['neutral'];
const STATE_ROLES = [
  'danger', 'success', 'warning', 'info',
  'neutral', 'locked', 'awaiting', 'blocked', 'offline',
];

/**
 * ds-fab-colors-tab — TAB "Colores": TODOS los tokens de color del design
 * system, leídos en vivo desde getComputedStyle (theme-aware).
 * Muestra cada rol con su ancla base y su escala derivada 50…950.
 */
@Component({
  selector: 'ds-fab-colors-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      @for (group of groups(); track group.title) {
        <div class="ds-ft__group">
          <div class="ds-ft__group-title">{{ i18n.t(group.title) }}</div>
          @for (role of group.roles; track role.name) {
            <div class="ds-ft__role">
              <div class="ds-ft__role-head">
                <span class="ds-ft__swatch-color" [style.background]="role.base.value"></span>
                <span class="ds-ft__role-name">{{ role.name }}</span>
                <code class="ds-ft__role-token">{{ role.base.token }}</code>
              </div>
              @if (role.steps.length) {
                <div class="ds-ft__scale">
                  @for (s of role.steps; track s.token) {
                    <div class="ds-ft__scale-cell" [title]="s.token">
                      <span class="ds-ft__scale-color" [style.background]="s.value"></span>
                      <span class="ds-ft__scale-step">{{ s.step }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }
      @if (groups().length === 0) {
        <div class="ds-ft__empty">No se encontraron tokens de color.</div>
      }
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 10px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7; margin-bottom: 4px;
    }
    .ds-ft__role {
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 5px 6px; margin-bottom: 4px;
    }
    .ds-ft__role-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .ds-ft__swatch-color {
      width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
      border: 1px solid var(--ds-designmode-control-border);
    }
    .ds-ft__role-name { font-size: 11px; font-weight: 700; color: var(--ds-designmode-inspector-on); text-transform: capitalize; }
    .ds-ft__role-token {
      font-family: monospace; font-size: 9px; color: var(--ds-designmode-inspector-on); opacity: 0.7;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
    }
    .ds-ft__scale {
      display: flex; flex-wrap: wrap; gap: 3px; margin-top: 5px;
    }
    .ds-ft__scale-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; width: 22px; }
    .ds-ft__scale-color {
      width: 20px; height: 16px; border-radius: 3px;
      border: 1px solid var(--ds-designmode-control-border);
    }
    .ds-ft__scale-step {
      font-family: monospace; font-size: 8px; color: var(--ds-designmode-inspector-on); opacity: 0.6;
    }
    .ds-ft__empty { font-size: 11px; color: var(--ds-designmode-inspector-on); opacity: 0.7; }
  `],
})
export class DsFabColorsTabComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly i18n = inject(FabI18nService);

  protected readonly groups = signal<ColorGroup[]>([]);

  constructor() {
    if (!this.isBrowser) return;
    const cs = getComputedStyle(this.document.documentElement);
    this.groups.set(this.buildGroups(cs));
  }

  /** Construye los grupos leyendo TODOS los --ds-color-* resueltos del CSS. */
  private buildGroups(cs: CSSStyleDeclaration): ColorGroup[] {
    const byToken = new Map<string, string>();
    for (let i = 0; i < cs.length; i++) {
      const name = cs.item(i);
      if (!name?.startsWith('--ds-color-')) continue;
      const value = cs.getPropertyValue(name).trim();
      if (value) byToken.set(name, value);
    }

    const roleGroups: { titleKey: string; roleNames: string[]; prefix: string }[] = [
      { titleKey: 'colors.design', roleNames: DESIGN_ROLES, prefix: 'design' },
      { titleKey: 'colors.state', roleNames: STATE_ROLES, prefix: 'state' },
    ];

    const groups: ColorGroup[] = roleGroups.map(({ titleKey, roleNames, prefix }) => ({
      title: titleKey,
      roles: roleNames
        .map((name) => this.buildRole(prefix, name, byToken))
        .filter((r) => r.base.value !== ''),
    })).filter((g) => g.roles.length > 0);

    // Especiales: white / black.
    const specials = ['white', 'black']
      .map((name) => {
        const token = `--ds-color-${name}`;
        return { token, value: byToken.get(token) ?? '' };
      })
      .filter((t) => t.value);
    if (specials.length) {
      groups.push({
        title: 'colors.special',
        roles: specials.map((t) => ({
          name: t.token.replace('--ds-color-', ''),
          base: t,
          steps: [],
        })),
      });
    }
    return groups;
  }

  private buildRole(
    prefix: string,
    name: string,
    byToken: Map<string, string>,
  ): ColorRole {
    const baseToken = `--ds-color-${prefix}-${name}`;
    const base: ColorToken = { token: baseToken, value: byToken.get(baseToken) ?? '' };

    const steps: ColorRole['steps'] = [];
    for (const step of ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']) {
      const token = `--ds-color-${prefix}-${name}-${step}`;
      const value = byToken.get(token);
      if (value) steps.push({ step, token, value });
    }
    return { name, base, steps };
  }
}
