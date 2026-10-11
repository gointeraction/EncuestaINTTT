import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { PreguntasSource, QuestionAnalytics } from '../models/preguntas.model';

/** Único contacto con el back-office de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class PreguntasDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async sources(): Promise<PreguntasSource[]> {
    const res = await firstValueFrom(this.api.publicReadControllerListSurveys());
    return (res as unknown as PreguntasSource[]) ?? [];
  }

  async questions(surveyId: string): Promise<QuestionAnalytics[]> {
    const res = (await firstValueFrom(
      this.api.reportingControllerSurvey(surveyId),
    )) as unknown as { questions?: QuestionAnalytics[] };
    return res?.questions ?? [];
  }
}
