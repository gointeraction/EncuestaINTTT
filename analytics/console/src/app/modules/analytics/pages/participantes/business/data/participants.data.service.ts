import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { ParticipantsPage } from '../models/participants.model';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class ParticipantsDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async participants(page: number, limit = 20): Promise<ParticipantsPage | null> {
    const res = await firstValueFrom(
      this.api.reportingControllerParticipants({ page: String(page), limit: String(limit) }),
    );
    return (res as unknown as ParticipantsPage) ?? null;
  }
}
