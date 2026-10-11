import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { SurveyPayload, SurveySource } from '../models/panel.model';

/** Único contacto con el back-office de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class PanelDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async loadSources(): Promise<SurveySource[]> {
    const res = await firstValueFrom(this.api.publicReadControllerListSurveys());
    return (res as unknown as SurveySource[]) ?? [];
  }

  async loadSurvey(surveyId: string): Promise<SurveyPayload | null> {
    const res = await firstValueFrom(this.api.reportingControllerSurvey(surveyId));
    return (res as unknown as SurveyPayload) ?? null;
  }
}
