import { Injectable, inject, signal } from '@angular/core';
import { RegisterDataService } from '../data/register.data.service';
import type { RegisterStateContract, RegisterStatus } from '../contracts/register.state.contract';
import type { RegisterInput } from '../models/register.model';

@Injectable()
export class RegisterStateService implements RegisterStateContract {
  private readonly data = inject(RegisterDataService);

  readonly status = signal<RegisterStatus>('idle');
  readonly error = signal<string | null>(null);

  async send(input: RegisterInput): Promise<boolean> {
    this.status.set('sending');
    this.error.set(null);
    try {
      await this.data.register(input);
      this.status.set('sent');
      return true;
    } catch (err) {
      const e = err as { status?: number };
      this.error.set(
        e?.status === 409
          ? 'Ese correo ya está registrado.'
          : 'No se pudo registrar la solicitud. Intente de nuevo.',
      );
      this.status.set('error');
      return false;
    }
  }

  reset(): void {
    this.status.set('idle');
    this.error.set(null);
  }
}
