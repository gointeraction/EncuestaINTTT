import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { FilterQuestion } from '../../../../../../shared/components/filter-builder/filter-builder.component';
import { API_BASE } from '../../../../../../core/api.config';
import type { FilterSet } from '../../../../../../shared/components/filter-builder/filter-builder.component';

/**
 * Contacto con el backend para EXPORTAR: construye las URLs de descarga del api-sdk.
 * La descarga es una NAVEGACIÓN del navegador (Content-Disposition: attachment), no un
 * fetch: así el archivo se guarda tal cual y la cookie de sesión viaja sola.
 */
@Injectable({ providedIn: 'root' })
export class ExportDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  /** Preguntas + opciones (para el constructor de filtros). */
  async questions(surveyId: string): Promise<FilterQuestion[]> {
    const res = (await firstValueFrom(
      this.api.reportingControllerSurvey(surveyId),
    )) as unknown as { questions?: Array<{ id: string; label: string; position?: number; options?: Array<{ value: string }> }> };
    return (res?.questions ?? []).map((q) => ({
      id: q.id, label: q.label, position: q.position,
      options: (q.options ?? []).map((o) => ({ value: o.value, label: o.value })),
    }));
  }
  /** Definición del cuestionario (catálogo de preguntas). */
  questionnaireUrl(surveyId: string): string {
    return `${API_BASE}/analytics/surveys/${encodeURIComponent(surveyId)}/questionnaire`;
  }

  /** Query de filtros (solo si hay condiciones) para exportar una SELECCIÓN. */
  private filterQuery(filters: FilterSet): string {
    const conditions = filters.conditions.filter((c) => !!c.questionId);
    if (conditions.length === 0) return '';
    const json = JSON.stringify({
      combinator: filters.combinator,
      conditions: conditions.map((c) => ({ questionId: c.questionId, values: c.values })),
    });
    return `?filters=${encodeURIComponent(json)}`;
  }

  /** Datos recolectados (una fila por entrevista). */
  collectedUrl(surveyId: string, filters: FilterSet): string {
    return `${API_BASE}/analytics/surveys/${encodeURIComponent(surveyId)}/export${this.filterQuery(filters)}`;
  }

  /** Datos en CSV LARGO (tidy): 1 fila por encuesta × pregunta. */
  collectedLongUrl(surveyId: string, filters: FilterSet): string {
    return `${API_BASE}/analytics/surveys/${encodeURIComponent(surveyId)}/export-long${this.filterQuery(filters)}`;
  }

  /** Datos CRUDOS en JSONL (NDJSON): el JSON tal como se importa. */
  collectedRawUrl(surveyId: string, filters: FilterSet): string {
    return `${API_BASE}/analytics/surveys/${encodeURIComponent(surveyId)}/export-raw${this.filterQuery(filters)}`;
  }
}
