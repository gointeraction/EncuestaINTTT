import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import type { FilterQuestionLite, ParticipantsPage } from '../models/participants.model';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class ParticipantsDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async records(kind: 'participants' | 'responses', page: number, limit: number, filters: FilterSet): Promise<ParticipantsPage | null> {
    const res = await firstValueFrom(
      this.api.reportingControllerRecords({
        kind,
        page,
        limit,
        combinator: filters.combinator,
        conditions: filters.conditions
          .filter((c) => !!c.questionId)
          .map((c) => ({ questionId: c.questionId, values: c.values })),
      }),
    );
    return (res as unknown as ParticipantsPage) ?? null;
  }

  /** Preguntas + opciones (para el constructor de filtros). */
  async questions(surveyId: string): Promise<FilterQuestionLite[]> {
    const res = (await firstValueFrom(
      this.api.reportingControllerSurvey(surveyId),
    )) as unknown as { questions?: FilterQuestionLite[] };
    return res?.questions ?? [];
  }
}
