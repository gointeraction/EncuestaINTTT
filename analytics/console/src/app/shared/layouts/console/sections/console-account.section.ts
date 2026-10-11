import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DsButtonComponent } from '@cifraflow/design';
import { SessionService } from '../../../../core/session.service';

/** Layout section (account): the signed-in staff member + the logout action. */
@Component({
  selector: 'app-console-account-section',
  standalone: true,
  imports: [DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex items-center gap-3">
      @if (session.user(); as user) {
        <span
          class="hidden max-w-[16rem] truncate sm:inline"
          style="font-size: var(--ds-text-small); opacity: 0.9"
        >
          {{ user.email }} · {{ user.role }}
        </span>
      }
      <ds-button variant="ghost" size="sm" icon="log-out" (click)="logout()">Salir</ds-button>
    </div>
  `,
})
export class ConsoleAccountSection {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected async logout(): Promise<void> {
    await this.session.logout();
    await this.router.navigateByUrl('/login');
  }
}
