import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type {
  FilterDimension,
  Segment,
  SurveyPayload,
  SurveySource,
  TimelinePoint,
} from '../models/panel.model';

/** Único contacto con el back-office de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class PanelDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async loadSources(): Promise<SurveySource[]> {
    const res = await firstValueFrom(this.api.publicReadControllerListSurveys());
    return (res as unknown as SurveySource[]) ?? [];
  }

  async loadSurvey(surveyId: string, segment?: Segment): Promise<SurveyPayload | null> {
    const res = await firstValueFrom(
      this.api.reportingControllerSurvey(surveyId, segment ? { ...segment } : undefined),
    );
    return (res as unknown as SurveyPayload) ?? null;
  }

  async loadDimensions(surveyId: string): Promise<FilterDimension[]> {
    const res = await firstValueFrom(this.api.reportingControllerDimensions(surveyId));
    return (res as unknown as FilterDimension[]) ?? [];
  }

  async loadTimeline(surveyId: string): Promise<TimelinePoint[]> {
    const res = await firstValueFrom(this.api.reportingControllerTimeline(surveyId));
    return (res as unknown as TimelinePoint[]) ?? [];
  }
}
