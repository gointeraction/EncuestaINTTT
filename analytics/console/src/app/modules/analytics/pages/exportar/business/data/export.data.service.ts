import { Injectable } from '@angular/core';
import { API_BASE } from '../../../../../../core/api.config';

/**
 * Contacto con el backend para EXPORTAR: construye las URLs de descarga del api-sdk.
 * La descarga es una NAVEGACIÓN del navegador (Content-Disposition: attachment), no un
 * fetch: así el archivo se guarda tal cual y la cookie de sesión viaja sola.
 */
@Injectable({ providedIn: 'root' })
export class ExportDataService {
  /** Definición del cuestionario (catálogo de preguntas). */
  questionnaireUrl(surveyId: string): string {
    return `${API_BASE}/analytics/surveys/${encodeURIComponent(surveyId)}/questionnaire`;
  }

  /** Datos recolectados (una fila por entrevista). */
  collectedUrl(surveyId: string): string {
    return `${API_BASE}/analytics/surveys/${encodeURIComponent(surveyId)}/export`;
  }

  /** Datos en CSV LARGO (tidy): 1 fila por encuesta × pregunta. */
  collectedLongUrl(surveyId: string): string {
    return `${API_BASE}/analytics/surveys/${encodeURIComponent(surveyId)}/export-long`;
  }

  /** Datos CRUDOS en JSONL (NDJSON): el JSON tal como se importa. */
  collectedRawUrl(surveyId: string): string {
    return `${API_BASE}/analytics/surveys/${encodeURIComponent(surveyId)}/export-raw`;
  }
}
