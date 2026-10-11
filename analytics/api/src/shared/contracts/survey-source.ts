/**
 * SurveySource — encuesta disponible para analizar (proyección de solo lectura
 * sobre el esquema public de la captura).
 */
export interface SurveySource {
  id: string;
  title: string;
  slug: string;
  status: string;
}
