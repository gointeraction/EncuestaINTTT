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
  readonly done = signal(false);

  async request(email: string): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.data.request(email);
      const approved = await this.data.isApproved(email);
      this.step.set(approved ? 'set' : 'sent');
    } catch {
      this.error.set('No se pudo enviar la solicitud. Intente de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }

  async continueIfApproved(email: string): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      const approved = await this.data.isApproved(email);
      if (approved) this.step.set('set');
      else this.error.set('La solicitud aún no ha sido autorizada.');
    } catch {
      this.error.set('No se pudo verificar el estado. Intente de nuevo.');
    } finally {
      this.busy.set(false);
    }
  }

  async submitReset(email: string, newPassword: string): Promise<boolean> {
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.data.reset(email, newPassword);
      this.done.set(true);
      return true;
    } catch {
      this.error.set('No hay una solicitud aprobada para este correo.');
      return false;
    } finally {
      this.busy.set(false);
    }
  }
}
