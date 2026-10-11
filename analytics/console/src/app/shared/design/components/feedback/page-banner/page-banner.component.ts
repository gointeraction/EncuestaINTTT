import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DsAlertComponent } from '../alert/alert.component';
import { DsPageBannerService as DsPageBannerService } from '../../../system/services/ds-page-banner.service';

/**
 * ds-page-banner — design-system page-level banner.
 * Renders the banner store (DsPageBannerService) as ds-alert rows.
 * tone="danger" surfaces errors (severity error/warning); tone="info" surfaces notifications.
 * Replaces the ds-error-banner / ds-notification-banner components.
 */
@Component({
  selector: 'ds-page-banner',
  standalone: true,
  imports: [DsAlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: flex; flex-direction: column; gap: var(--ds-space-2); width: 100%;' },
  template: `
    @for (msg of messages(); track msg.id) {
      <ds-alert [tone]="alertTone(msg.severity)" [dismissible]="true" (dismissed)="dismiss(msg.id)">
        {{ msg.message }}
      </ds-alert>
    }
  `,
})
export class DsPageBannerComponent {
  readonly tone = input<'danger' | 'info'>('danger');

  protected readonly bannerSvc = inject(DsPageBannerService);

  protected readonly messages = computed(() =>
    this.tone() === 'danger' ? this.bannerSvc.errors() : this.bannerSvc.notifications(),
  );

  protected alertTone(severity: string): 'info' | 'warning' | 'danger' {
    if (severity === 'warning') return 'warning';
    if (severity === 'error') return 'danger';
    return 'info';
  }

  protected dismiss(id: string): void {
    if (this.tone() === 'danger') {
      this.bannerSvc.dismissError(id);
    } else {
      this.bannerSvc.dismissNotification(id);
    }
  }
}