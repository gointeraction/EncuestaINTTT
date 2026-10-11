import { Injectable, inject, signal } from '@angular/core';
import { SessionService } from '../../../../../../core/session.service';
import { LoginDataService } from '../data/login.data.service';
import type { LoginStateContract, LoginStatus } from '../contracts/login.state.contract';

@Injectable()
export class LoginStateService implements LoginStateContract {
  private readonly data = inject(LoginDataService);
  private readonly session = inject(SessionService);

  readonly status = signal<LoginStatus>('idle');
  readonly error = signal<string | null>(null);

  async login(email: string, password: string): Promise<boolean> {
    this.status.set('submitting');
    this.error.set(null);
    try {
      const result = await this.data.login({ email, password });
      if (!result.user) {
        this.error.set('Credenciales inválidas.');
        this.status.set('error');
        return false;
      }
      await this.session.refresh();
      this.status.set('success');
      return true;
    } catch {
      this.error.set('Servicio no disponible.');
      this.status.set('error');
      return false;
    }
  }
}
