/**
 * Registro de cuestionarios (A2: 00-manifest/questionnaires-registry.md).
 * El sistema administra N cuestionarios; la analítica deriva su fuente/etiquetas/segmentos
 * de AQUÍ, no de constantes de un caso particular. Hoy hay uno: Visión Cero.
 */
export interface Questionnaire {
  id: string;
  title: string;
  /** Fuente de captura (los "cuestionarios respondidos"). */
  source: {
    table: string;
    answersField: string;
    segmentsField: string;
    /** Slug del cuestionario en la tabla (columna `survey_id`). */
    surveyId?: string;
    channelField?: string;
    sorteoField?: string;
    timeField?: string;
    /** Campo de dispositivo (para el panel de anomalías). */
    deviceField?: string;
    /** Campo de captura (dispositivo); la timeline lo prefiere sobre timeField. */
    captureField?: string;
  };
  /** Campo de segmentación → etiqueta (p.ej. driverType). */
  segments: Record<string, string>;
  /** Canal/modalidad → etiqueta (public=CAWI, kiosk/surveyor=presencial). */
  channels: Record<string, string>;
  /** pregunta-id → etiqueta. */
  labels: Record<string, string>;
  /** Rangos (límites) por pregunta numérica → se presenta agrupada por rango. */
  bins?: Record<string, number[]>;
  /**
   * Preguntas AUTOCONTESTADAS (derivadas): se responden a partir de UNA O MÁS respuestas
   * previas mediante un ALGORITMO. Declaran sus `sources`; el valor se obtiene con `bins`
   * (agrupa un numérico) o con `compute` (algoritmo a medida → valor categórico).
   */
  derived?: DerivedQuestion[];
}

export interface DerivedQuestion {
  id: string;
  label: string;
  /** Ids de las preguntas de origen (una o más). */
  sources: string[];
  /** Agrupa por rangos (una sola fuente numérica). */
  bins?: number[];
  /** Algoritmo sobre las respuestas de origen → valor derivado (categórico) o null. */
  compute?: (answers: Record<string, unknown>) => string | null;
}

/** Etiquetas de canal/modalidad (ver glossary: CAWI / presencial). */
export const CHANNEL_LABELS: Record<string, string> = {
  public: 'Autoservicio (en línea)',
  kiosk: 'Kiosco',
  surveyor: 'Encuestador',
};

/** Etiquetas de los tipos de conductor (fuente: src/lib/survey-data.ts). */
export const DRIVER_LABELS: Record<string, string> = {
  motociclista_activo: 'Motociclista activo',
  delivery: 'Delivery / Mensajero',
  mototaxista: 'Mototaxista',
  ex_motociclista: 'Ex motociclista',
  familiar: 'Familiar de víctima',
  otro_conductor: 'Otro conductor / peatón',
};

/** Etiquetas de las preguntas de Visión Cero (ids reales; fuente: src/lib/survey-data.ts). */
export const VISION_CERO_LABELS: Record<string, string> = {
  estado: 'Estado',
  municipio: 'Municipio',
  edad: '¿Cuál es tu edad?',
  sexo: 'Sexo',
  ubicacion: '¿En qué estado y municipio resides?',
  ocupacion: 'Ocupación principal',
  nivel_educativo: 'Nivel educativo alcanzado',
  anos_conduciendo: '¿Cuántos años llevas conduciendo motocicleta?',
  licencia: '¿Posees licencia de conducción vigente?',
  categoria_licencia: '¿Qué categoría de licencia tienes?',
  motivo_no_licencia: '¿Por qué no tienes licencia?',
  frecuencia_conduccion: '¿Con qué frecuencia conduces la motocicleta?',
  dejo_conducir_razon: '¿Por qué dejaste de conducir motocicleta?',
  uso_principal: '¿Cuál es el uso principal de tu motocicleta?',
  uso_otro: 'Especifica otro uso',
  km_diarios: '¿Cuántos kilómetros recorres al día?',
  horas_diarias: '¿Cuántas horas al día conduces?',
  plataforma_delivery: '¿Para qué plataforma(s) trabajas?',
  pasajeros_dia: '¿Cuántos pasajeros transportas al día?',
  conduccion_nocturna: '¿Conduces de noche (después de las 9 pm)?',
  clima_lluvia: '¿Conduces con lluvia o condiciones adversas?',
  casco_usa: '¿Usas casco al conducir?',
  casco_tipo: '¿Qué tipo de casco usas?',
  casco_certificado: '¿Tu casco está certificado (DOT, ECE, SNELL)?',
  motivo_no_casco: '¿Por qué no usas casco?',
  equipamiento_adicional: '¿Qué otros elementos de protección usas?',
  elementos_moto: '¿Qué elementos de seguridad tiene tu motocicleta?',
  velocidad_opinion: '¿Conduces a una velocidad adecuada al límite? (1-5)',
  uso_celular: '¿Usas el celular mientras conduces?',
  alcohol_conduccion: '¿Has conducido tras consumir alcohol?',
  pasajeros_extra: '¿Transportas a más de un pasajero?',
  rebases_peatones: '¿Respetas el paso de peatones? (1-5)',
  presion_tiempo: '¿Sientes presión por el tiempo al conducir?',
  fatiga: '¿Conduces aunque sientas fatiga o sueño?',
  ha_tenido_siniestro: '¿Has tenido un siniestro con motocicleta?',
  siniestro_gravedad: 'Gravedad del siniestro más reciente',
  siniestro_ano: 'Año del siniestro más reciente',
  siniestro_causas: 'Factores que causaron el siniestro',
  siniestro_atencion: '¿Recibiste atención médica tras el siniestro?',
  familiar_relacion: 'Parentesco con la víctima',
  familiar_siniestro_tipo: 'Resultado del siniestro del familiar',
  causas_principales: 'Causas principales de siniestros',
  medidas_efectivas: 'Medidas más efectivas',
  efectividad_control: 'Efectividad del control de tránsito (1-5)',
  percepcion_seguridad: 'Percepción de seguridad al conducir (1-5)',
  estado_vias: 'Estado general de las vías (1-5)',
  senalizacion: 'Claridad de la señalización (1-5)',
  iluminacion: 'Iluminación de vías nocturnas',
  problemas_via: 'Problemas de infraestructura frecuentes',
  conoce_limites_velocidad: '¿Conoces los límites de velocidad?',
  conoce_alcoholemia: '¿Conoces las normas de alcoholemia?',
  conoce_sanciones: '¿Conoces las sanciones de tránsito?',
  recibio_capacitacion: '¿Recibiste capacitación formal?',
  propuesta_principal: 'Acción más urgente para reducir siniestros',
  apoyo_vision_cero: '¿Apoyas la política Visión Cero?',
  disposicion_participar: '¿Dispuesto a participar en campañas?',
  comentario_final: 'Comentario final',
};

export const QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'vision-cero',
    title: 'Visión Cero — Motocicletas',
    source: {
      table: 'public.legacy_survey_responses',
      answersField: 'answers',
      segmentsField: 'driverType',
      surveyId: 'vision-cero',
      channelField: 'channel',
      sorteoField: 'participaSorteo',
      timeField: 'completedAt',
      captureField: 'capturedAt',
      deviceField: 'device_id',
    },
    segments: DRIVER_LABELS,
    channels: CHANNEL_LABELS,
    labels: VISION_CERO_LABELS,
    bins: {
      edad: [14, 25, 35, 45, 55, 100],
      anos_conduciendo: [0, 5, 10, 15, 20, 100],
      km_diarios: [0, 25, 50, 75, 100, 1000],
      horas_diarias: [0, 2, 4, 6, 8, 24],
      pasajeros_dia: [0, 1, 3, 5, 20, 100],
    },
    // Preguntas autocontestadas (derivadas) a partir de una respuesta numérica.
    derived: [
      { id: 'rango_edad', label: 'Rango de edad', sources: ['edad'], bins: [14, 25, 35, 45, 55, 100] },
      { id: 'rango_anos_conduciendo', label: 'Años conduciendo (rango)', sources: ['anos_conduciendo'], bins: [0, 5, 10, 15, 20, 100] },
      { id: 'rango_km_diarios', label: 'Km diarios (rango)', sources: ['km_diarios'], bins: [0, 25, 50, 75, 100, 1000] },
      { id: 'rango_horas_diarias', label: 'Horas diarias (rango)', sources: ['horas_diarias'], bins: [0, 2, 4, 6, 8, 24] },
      { id: 'rango_pasajeros_dia', label: 'Pasajeros por día (rango)', sources: ['pasajeros_dia'], bins: [0, 1, 3, 5, 20, 100] },
    ],
  },
];

/** Cuestionario principal (mientras hay uno). Con el registro completo, se itera QUESTIONNAIRES. */
export const PRIMARY_QUESTIONNAIRE = QUESTIONNAIRES[0];
