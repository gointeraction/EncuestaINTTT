import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { CrossTabResult, ReportQuestion, ReportSurveySource } from '../models/reportes.model';

/** Único contacto con el back-office de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class ReportesDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async sources(): Promise<ReportSurveySource[]> {
    const res = await firstValueFrom(this.api.publicReadControllerListSurveys());
    return (res as unknown as ReportSurveySource[]) ?? [];
  }

  /** Todas las preguntas del resumen (originales + autocontestadas) para cruzar. */
  async questions(surveyId: string): Promise<ReportQuestion[]> {
    const res = (await firstValueFrom(
      this.api.reportingControllerSurvey(surveyId),
    )) as unknown as { questions?: ReportQuestion[] };
    return res?.questions ?? [];
  }

  async crossTab(surveyId: string, q1: string, q2: string): Promise<CrossTabResult | null> {
    const res = await firstValueFrom(
      this.api.reportingControllerCrossTab(surveyId, { q1, q2 }),
    );
    return (res as unknown as CrossTabResult) ?? null;
  }
}
