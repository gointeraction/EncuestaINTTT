import { Injectable, inject, signal } from '@angular/core';
import { SessionService } from '../../../../../../core/session.service';
import { LoginDataService } from '../data/login.data.service';
import type { LoginStateContract } from '../contracts/login.state.contract';

@Injectable()
export class LoginStateService implements LoginStateContract {
  private readonly data = inject(LoginDataService);
  private readonly session = inject(SessionService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async login(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await this.data.login({ email, password });
      if (!result.user) {
        this.error.set('Credenciales inválidas.');
        return false;
      }
      await this.session.refresh();
      return true;
    } catch {
      this.error.set('Servicio no disponible.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }
}
