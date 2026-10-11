import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DsMessagesService } from '../../design/system';
import { FabService } from '../services/fab.service';
import { DsInspectorService, type HardcodedReport } from '../services/ds-inspector.service';
import { FabI18nService } from '../services/fab-i18n.service';

/**
 * ds-fab-notifications-tab — TAB "Notificaciones": botones de prueba de los
 * toasts + detector de violaciones hardcoded (colores/espaciado/tipografía
 * literales que violan la política "solo tokens semánticos").
 */
@Component({
  selector: 'ds-fab-notifications-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-ft">
      <div class="ds-ft__group-title">{{ i18n.t('notif.test') }}</div>
      <div class="ds-ft__box ds-ft__box--row">
        <button class="ds-ft__notif" [class.ds-ft__notif--info]="true" (click)="notify('info', i18n.t('notif.info'))">
          <span class="ds-fab__dot" style="background: var(--ds-color-tooling-fab-notif-info)"></span>{{ i18n.t('notif.infoShort') }}
        </button>
        <button class="ds-ft__notif" [class.ds-ft__notif--warning]="true" (click)="notify('warning', i18n.t('notif.warning'))">
          <span class="ds-fab__dot" style="background: var(--ds-color-tooling-fab-notif-warning)"></span>{{ i18n.t('notif.warning') }}
        </button>
        <button class="ds-ft__notif" [class.ds-ft__notif--error]="true" (click)="notify('error', i18n.t('notif.error'))">
          <span class="ds-fab__dot" style="background: var(--ds-color-tooling-fab-notif-error)"></span>{{ i18n.t('notif.error') }}
        </button>
        <button class="ds-ft__notif" [class.ds-ft__notif--success]="true" (click)="notify('success', i18n.t('notif.success'))">
          <span class="ds-fab__dot" style="background: var(--ds-color-tooling-fab-notif-success)"></span>{{ i18n.t('notif.successShort') }}
        </button>
      </div>

      <div class="ds-ft__group-title ds-ft__spacer">{{ i18n.t('notif.hardcodedDetector') }}</div>
      <div class="ds-ft__box">
        <div class="ds-ft__scan-row">
          <button class="ds-ft__scan" (click)="scan()">{{ i18n.t('notif.detect') }}</button>
          <button class="ds-ft__scan ds-ft__scan--ghost" (click)="markErrors()">
            {{ marking() ? i18n.t('notif.marking') : i18n.t('notif.markPage') }}
          </button>
        </div>

        @if (report(); as r) {
          <div class="ds-ft__summary">
            <span [class.ds-ft__badge--ok]="r.total === 0" [class.ds-ft__badge--warn]="r.total > 0">
              {{ r.total === 0 ? i18n.t('notif.noViolations') : '⚠ ' + r.total + ' ' + i18n.t('notif.violations') }}
            </span>
          </div>
          <div class="ds-ft__counts">
            <span>{{ i18n.t('notif.colors') }} <b>{{ r.colors.length }}</b></span>
            <span>{{ i18n.t('notif.spacing') }} <b>{{ r.spacing.length }}</b></span>
            <span>{{ i18n.t('notif.typography') }} <b>{{ r.typography.length }}</b></span>
          </div>
          @if (r.total > 0) {
            <div class="ds-ft__violations">
              @for (v of sample(); track $index) {
                <div class="ds-ft__violation">
                  <span class="ds-ft__violation-tag">{{ v.property }}</span>
                  <span class="ds-ft__violation-body">
                    <span class="ds-ft__violation-el">{{ v.element }}</span>
                    <code class="ds-ft__violation-val">{{ v.value }}</code>
                  </span>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .ds-ft { display: flex; flex-direction: column; gap: 8px; }
    .ds-ft__group-title {
      font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--ds-designmode-inspector-on); opacity: 0.7;
    }
    .ds-ft__spacer { margin-top: 4px; }
    .ds-ft__box {
      display: flex; flex-direction: column; gap: 6px;
      background: var(--ds-designmode-control-bg);
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 6px; padding: 6px 8px;
    }
    .ds-ft__box--row { flex-direction: row; flex-wrap: wrap; gap: 4px; }
    .ds-ft__notif {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 8px; border-radius: 6px; cursor: pointer;
      border: 1px solid var(--ds-designmode-control-border);
      background: var(--ds-designmode-control-bg);
      color: var(--ds-designmode-inspector-on); font-size: 10px; font-weight: 600;
    }
    .ds-ft__notif:hover { filter: brightness(1.12); }
    .ds-ft__notif--info { color: var(--ds-color-tooling-fab-notif-info); }
    .ds-ft__notif--warning { color: var(--ds-color-tooling-fab-notif-warning); }
    .ds-ft__notif--error { color: var(--ds-color-tooling-fab-notif-error); }
    .ds-ft__notif--success { color: var(--ds-color-tooling-fab-notif-success); }
    .ds-ft__scan-row { display: flex; gap: 4px; }
    .ds-ft__scan {
      flex: 1; padding: 5px 8px; border-radius: 6px; cursor: pointer;
      border: 1px solid var(--ds-designmode-control-border);
      background: var(--ds-designmode-fab-active); color: var(--ds-designmode-fab-active-on);
      font-size: 10px; font-weight: 700;
    }
    .ds-ft__scan:hover { filter: brightness(1.1); }
    .ds-ft__scan--ghost { background: transparent; color: var(--ds-designmode-inspector-on); font-weight: 600; }
    .ds-ft__summary { font-size: 11px; font-weight: 700; }
    .ds-ft__badge--ok { color: var(--ds-color-tooling-fab-notif-success); }
    .ds-ft__badge--warn { color: var(--ds-color-tooling-fab-notif-warning); }
    .ds-ft__counts { display: flex; gap: 10px; font-size: 10px; color: var(--ds-designmode-inspector-on); opacity: 0.8; }
    .ds-ft__counts b { color: var(--ds-designmode-inspector-on); }
    .ds-ft__violations { display: flex; flex-direction: column; gap: 3px; max-height: 180px; overflow-y: auto; }
    .ds-ft__violation {
      display: flex; align-items: center; gap: 6px;
      border: 1px solid var(--ds-designmode-control-border);
      border-radius: 5px; padding: 3px 6px; background: var(--ds-designmode-inspector-bg);
    }
    .ds-ft__violation-tag {
      font-size: 8px; font-weight: 700; text-transform: uppercase;
      background: var(--ds-designmode-fab-active); color: var(--ds-designmode-fab-active-on);
      padding: 1px 5px; border-radius: 3px; flex-shrink: 0;
    }
    .ds-ft__violation-body { display: flex; flex-direction: column; min-width: 0; }
    .ds-ft__violation-el { font-size: 9px; color: var(--ds-designmode-inspector-on); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ds-ft__violation-val { font-family: monospace; font-size: 9px; color: var(--ds-color-tooling-fab-notif-warning); }
  `],
})
export class DsFabNotificationsTabComponent {
  private readonly messages = inject(DsMessagesService);
  private readonly inspector = inject(DsInspectorService);
  private readonly fabSvc = inject(FabService);
  protected readonly i18n = inject(FabI18nService);

  protected readonly report = signal<HardcodedReport | null>(null);
  protected readonly sample = signal<{ element: string; property: string; value: string }[]>([]);
  protected readonly marking = signal(false);

  protected notify(tone: 'info' | 'warning' | 'error' | 'success', message: string): void {
    this.messages.emit(tone, message, 'FAB');
  }

  protected scan(): void {
    const r = this.inspector.detectHardcoded();
    this.report.set(r);
    const all = [...r.colors, ...r.spacing, ...r.typography];
    this.sample.set(all.slice(0, 10));
  }

  protected markErrors(): void {
    // Muestra las violaciones en la página (marca visual) vía el global "Errores".
    this.fabSvc.toggleErrors();
    this.marking.set(!this.marking());
  }
}