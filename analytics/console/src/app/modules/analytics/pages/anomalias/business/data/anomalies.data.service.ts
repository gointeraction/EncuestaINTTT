import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { AnomaliesPayload } from '../models/anomalies.model';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class AnomaliesDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async anomalies(surveyId: string): Promise<AnomaliesPayload | null> {
    const res = await firstValueFrom(this.api.reportingControllerAnomalies({ survey: surveyId }));
    return (res as unknown as AnomaliesPayload) ?? null;
  }
}
