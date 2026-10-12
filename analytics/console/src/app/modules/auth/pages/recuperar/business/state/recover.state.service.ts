import { Injectable, inject, signal } from '@angular/core';
import { RecoverDataService } from '../data/recover.data.service';
import type { RecoverStateContract } from '../contracts/recover.state.contract';
import type { PasswordResetStep } from '../models/recover.model';

@Injectable()
export class RecoverStateService implements RecoverStateContract {
  private readonly data = inject(RecoverDataService);

  readonly step = signal<PasswordResetStep>('request');
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  private async withBusy<T>(fn: () => Promise<T>): Promise<T | undefined> {
    this.busy.set(true);
    this.error.set(null);
    try {
      return await fn();
    } catch {
      this.error.set('No se pudo contactar el servicio. Intente de nuevo.');
      return undefined;
    } finally {
      this.busy.set(false);
    }
  }

  /** Consulta el estado: aprobado → formulario; pendiente → aviso; ninguno → crea solicitud → aviso. */
  async lookup(email: string): Promise<void> {
    await this.withBusy(async () => {
      const status = await this.data.status(email);
      if (status === 'approved') {
        this.step.set('set');
        return;
      }
      if (status !== 'pending') {
        await this.data.request(email);
      }
      this.step.set('pending');
    });
  }

  /** Re-consulta: si el admin ya autorizó, pasa al formulario. */
  async recheck(email: string): Promise<void> {
    await this.withBusy(async () => {
      const status = await this.data.status(email);
      if (status === 'approved') {
        this.step.set('set');
      } else if (status === 'pending') {
        this.error.set('Tu solicitud aún está en proceso de aprobación.');
      } else {
        this.error.set('No hay una solicitud activa para ese correo.');
      }
    });
  }

  async submitReset(email: string, newPassword: string): Promise<boolean> {
    const ok = await this.withBusy(async () => {
      await this.data.reset(email, newPassword);
      return true;
    });
    if (ok) this.step.set('done');
    return !!ok;
  }
}
