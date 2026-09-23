// ============================================================================
// Visión Cero en Siniestros de Motocicletas — Definición de Encuesta
// ============================================================================
// El núcleo de esta encuesta es la LÓGICA CONDICIONAL:
// - `appliesTo`: filtra preguntas según el TIPO DE CONDUCTOR
// - `showIf`:    filtra preguntas según respuestas anteriores (branching)
// ============================================================================

export type DriverTypeId =
  | "motociclista_activo"
  | "delivery"
  | "mototaxista"
  | "ex_motociclista"
  | "familiar"
  | "otro_conductor";

export interface DriverType {
  id: DriverTypeId;
  label: string;
  description: string;
  icon: string; // lucide icon name
}

export type QuestionType =
  | "radio"
  | "checkbox"
  | "text"
  | "textarea"
  | "scale"
  | "select"
  | "number";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  help?: string;
  options?: string[];
  /** A qué tipos de conductor aplica. "all" = todos. */
  appliesTo: DriverTypeId[] | "all";
  /** Mostrar solo si la respuesta a otra pregunta coincide con un valor. */
  showIf?: { questionId: string; value: string | string[] };
  required?: boolean;
  unit?: string; // para number, p.ej. "años"
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

export interface Section {
  id: string;
  title: string;
  description: string;
  icon: string;
  appliesTo: DriverTypeId[] | "all";
  questions: Question[];
}

// ============================================================================
// TIPOS DE CONDUCTOR
// ============================================================================

export const DRIVER_TYPES: DriverType[] = [
  {
    id: "motociclista_activo",
    label: "Motociclista activo",
    description: "Conduzco motocicleta actualmente, por uso particular.",
    icon: "Bike",
  },
  {
    id: "delivery",
    label: "Delivery / Mensajero",
    description: "Conduzco motocicleta como parte de mi trabajo (delivery, mensajería).",
    icon: "PackageCheck",
  },
  {
    id: "mototaxista",
    label: "Mototaxista",
    description: "Conduzco motocicleta prestando servicio de transporte de pasajeros.",
    icon: "Users",
  },
  {
    id: "ex_motociclista",
    label: "Ex motociclista",
    description: "Conduje motocicleta en el pasado pero ya no lo hago.",
    icon: "History",
  },
  {
    id: "familiar",
    label: "Familiar de víctima",
    description: "Soy familiar o cercano a una persona víctima de un siniestro de motocicleta.",
    icon: "HeartHandshake",
  },
  {
    id: "otro_conductor",
    label: "Otro conductor / peatón",
    description: "Conduzco otro vehículo (carro, bicicleta) o soy peatón.",
    icon: "Car",
  },
];

// ============================================================================
// SECCIONES Y PREGUNTAS
// ============================================================================

export const SURVEY: { title: string; subtitle: string; sections: Section[] } = {
  title: "Hacia una Visión Cero en Siniestros de Motocicletas",
  subtitle:
    "Encuesta para identificar causas, percepciones y propuestas de mejora. Las preguntas se adaptan a tu perfil de conductor.",
  sections: [
    // --------------------------------------------------------------------------
    {
      id: "demograficos",
      title: "1. Datos demográficos",
      description: "Información básica para segmentar los resultados.",
      icon: "UserRound",
      appliesTo: "all",
      questions: [
        {
          id: "edad",
          type: "number",
          text: "¿Cuál es tu edad?",
          unit: "años",
          appliesTo: "all",
          required: true,
          scaleMin: 14,
          scaleMax: 90,
        },
        {
          id: "sexo",
          type: "radio",
          text: "Sexo",
          appliesTo: "all",
          required: true,
          options: ["Femenino", "Masculino", "Otro / Prefiero no decir"],
        },
        {
          id: "ciudad",
          type: "text",
          text: "¿En qué ciudad o municipio resides?",
          appliesTo: "all",
          required: true,
        },
        {
          id: "ocupacion",
          type: "text",
          text: "Ocupación principal",
          appliesTo: "all",
        },
        {
          id: "nivel_educativo",
          type: "select",
          text: "Nivel educativo alcanzado",
          appliesTo: "all",
          options: [
            "Primaria incompleta",
            "Primaria completa",
            "Secundaria incompleta",
            "Secundaria completa",
            "Técnico/Tecnólogo",
            "Universitario incompleto",
            "Universitario completo",
            "Posgrado",
          ],
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "experiencia",
      title: "2. Experiencia como conductor de motocicleta",
      description: "Tu trayectoria conduciendo motocicleta.",
      icon: "Gauge",
      appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
      questions: [
        {
          id: "anos_conduciendo",
          type: "number",
          text: "¿Cuántos años llevas (o llevaste) conduciendo motocicleta?",
          unit: "años",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          required: true,
        },
        {
          id: "licencia",
          type: "radio",
          text: "¿Posees licencia de conducción vigente para motocicleta?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          required: true,
          options: ["Sí, vigente", "Sí, vencida", "No tengo licencia", "Estoy en trámite"],
        },
        {
          id: "categoria_licencia",
          type: "select",
          text: "¿Qué categoría de licencia tienes?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          showIf: { questionId: "licencia", value: ["Sí, vigente", "Sí, vencida"] },
          options: ["A1", "A2", "B1", "C1", "C2", "Otra", "No estoy seguro"],
        },
        {
          id: "motivo_no_licencia",
          type: "textarea",
          text: "¿Por qué no tienes licencia?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          showIf: { questionId: "licencia", value: "No tengo licencia" },
        },
        {
          id: "frecuencia_conduccion",
          type: "radio",
          text: "¿Con qué frecuencia conduces (o conducías) la motocicleta?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          required: true,
          options: [
            "Todos los días",
            "Varias veces por semana",
            "Una vez por semana",
            "Ocasionalmente",
            "Ya no conduzco",
          ],
        },
        {
          id: "dejo_conducir_razon",
          type: "textarea",
          text: "¿Por qué dejaste de conducir motocicleta?",
          appliesTo: ["ex_motociclista"],
          showIf: { questionId: "frecuencia_conduccion", value: "Ya no conduzco" },
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "uso_moto",
      title: "3. Uso de la motocicleta",
      description: "Para qué usas la motocicleta y en qué condiciones.",
      icon: "Route",
      appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
      questions: [
        {
          id: "uso_principal",
          type: "radio",
          text: "¿Cuál es el uso principal de tu motocicleta?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          required: true,
          options: [
            "Transporte al trabajo / estudio",
            "Trabajo (delivery / mensajería)",
            "Transporte de pasajeros (mototaxi)",
            "Recreativo / paseo",
            "Otro",
          ],
        },
        {
          id: "uso_otro",
          type: "text",
          text: "Especifica otro uso:",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          showIf: { questionId: "uso_principal", value: "Otro" },
        },
        {
          id: "km_diarios",
          type: "number",
          text: "Aproximadamente, ¿cuántos kilómetros recorres al día?",
          unit: "km/día",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
        },
        {
          id: "horas_diarias",
          type: "number",
          text: "¿Cuántas horas al día conduces en promedio?",
          unit: "horas",
          appliesTo: ["delivery", "mototaxista"],
        },
        {
          id: "plataforma_delivery",
          type: "text",
          text: "¿Para qué plataforma(s) trabajas? (ej. Uber Eats, Rappi, PedidosYa, propia)",
          appliesTo: ["delivery"],
        },
        {
          id: "pasajeros_dia",
          type: "number",
          text: "¿Cuántos pasajeros transportas en promedio al día?",
          unit: "pasajeros",
          appliesTo: ["mototaxista"],
        },
        {
          id: "conduccion_nocturna",
          type: "radio",
          text: "¿Conduces con frecuencia de noche (después de las 9 pm)?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          options: ["Sí, frecuentemente", "A veces", "Rara vez", "Nunca"],
        },
        {
          id: "clima_lluvia",
          type: "radio",
          text: "¿Conduces incluso con lluvia o condiciones adversas?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          options: ["Sí, siempre", "A veces, si es necesario", "No, evito conducir"],
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "equipamiento",
      title: "4. Equipamiento de seguridad",
      description: "Elementos de protección que usas o usabas.",
      icon: "ShieldCheck",
      appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
      questions: [
        {
          id: "casco_usa",
          type: "radio",
          text: "¿Usas (o usabas) casco al conducir?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          required: true,
          options: ["Siempre", "Casi siempre", "A veces", "Rara vez", "Nunca"],
        },
        {
          id: "casco_tipo",
          type: "select",
          text: "¿Qué tipo de casco usas?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          showIf: { questionId: "casco_usa", value: ["Siempre", "Casi siempre", "A veces", "Rara vez"] },
          options: ["Integral", "Modular", "Jet / abierto", "Cross / motocross", "Bicicleta / no certificado"],
        },
        {
          id: "casco_certificado",
          type: "radio",
          text: "¿Tu casco tiene certificación de seguridad (DOT, ECE, SNELL)?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          showIf: { questionId: "casco_usa", value: ["Siempre", "Casi siempre", "A veces", "Rara vez"] },
          options: ["Sí", "No", "No lo sé"],
        },
        {
          id: "motivo_no_casco",
          type: "textarea",
          text: "¿Por qué no usas casco?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          showIf: { questionId: "casco_usa", value: "Nunca" },
        },
        {
          id: "equipamiento_adicional",
          type: "checkbox",
          text: "¿Qué otros elementos de protección usas habitualmente?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          options: [
            "Chaqueta con refuerzos / cordura",
            "Guantes",
            "Botas o calzado cerrado",
            "Pantalón de protección",
            "Rodilleras",
            "Chaleco reflectivo",
            "Protección lumbar",
            "Ninguno",
          ],
        },
        {
          id: "elementos_moto",
          type: "checkbox",
          text: "¿Qué elementos de seguridad tiene tu motocicleta?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          options: [
            "Luces delanteras y traseras funcionando",
            "Luces direccionales (intermitentes)",
            "Espejos retrovisores",
            "Frenos en buen estado",
            "Llantas en buen estado",
            "Claxon / bocina",
            "Pito / alarma",
            "No estoy seguro",
          ],
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "comportamiento",
      title: "5. Comportamiento y prácticas de conducción",
      description: "Hábitos al volante que influyen en la seguridad.",
      icon: "Activity",
      appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
      questions: [
        {
          id: "velocidad_opinion",
          type: "scale",
          text: "En una escala de 1 a 5, ¿consideras que conduces a una velocidad adecuada al límite?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          required: true,
          scaleMin: 1,
          scaleMax: 5,
          scaleLabels: { min: "Nunca respeto el límite", max: "Siempre respeto el límite" },
        },
        {
          id: "uso_celular",
          type: "radio",
          text: "¿Usas el celular mientras conduces (llamadas, mensajes, GPS)?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          required: true,
          options: ["Sí, frecuentemente", "A veces", "Solo GPS", "Nunca"],
        },
        {
          id: "alcohol_conduccion",
          type: "radio",
          text: "¿Has conducido después de consumir alcohol?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          required: true,
          options: ["Sí, varias veces", "Sí, alguna vez", "Nunca"],
        },
        {
          id: "pasajeros_extra",
          type: "radio",
          text: "¿Transportas a más de un pasajero (triples / cuádruples)?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          options: ["Frecuentemente", "A veces", "Nunca"],
        },
        {
          id: "rebases_peatones",
          type: "scale",
          text: "¿Respetas el paso de peatones en cruces y semáforos?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista"],
          scaleMin: 1,
          scaleMax: 5,
          scaleLabels: { min: "Nunca", max: "Siempre" },
        },
        {
          id: "presion_tiempo",
          type: "radio",
          text: "¿Sientes presión por el tiempo (entregas, pasajeros) que te hace conducir más rápido?",
          appliesTo: ["delivery", "mototaxista"],
          options: ["Siempre", "Frecuentemente", "A veces", "Rara vez", "Nunca"],
        },
        {
          id: "fatiga",
          type: "radio",
          text: "¿Conduces aunque sientas fatiga o sueño?",
          appliesTo: ["delivery", "mototaxista"],
          options: ["Frecuentemente", "A veces", "Rara vez", "Nunca"],
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "siniestros",
      title: "6. Experiencia con siniestros de tránsito",
      description: "Accidentes y eventos relacionados con motocicletas.",
      icon: "Siren",
      appliesTo: "all",
      questions: [
        {
          id: "ha_tenido_siniestro",
          type: "radio",
          text: "¿Has tenido algún siniestro de tránsito con motocicleta (como conductor, pasajero o peatón)?",
          appliesTo: "all",
          required: true,
          options: ["Sí, como conductor de moto", "Sí, como pasajero de moto", "Sí, como peatón/otro vehículo", "No, nunca"],
        },
        {
          id: "siniestro_gravedad",
          type: "radio",
          text: "¿Qué tan grave fue el siniestro más reciente?",
          appliesTo: "all",
          showIf: {
            questionId: "ha_tenido_siniestro",
            value: ["Sí, como conductor de moto", "Sí, como pasajero de moto", "Sí, como peatón/otro vehículo"],
          },
          options: ["Solo daños materiales", "Lesiones leves", "Lesiones graves", "Fallecimiento", "Fallecimiento de otra persona"],
        },
        {
          id: "siniestro_ano",
          type: "number",
          text: "¿En qué año ocurrió el siniestro más reciente?",
          unit: "año",
          appliesTo: "all",
          showIf: {
            questionId: "ha_tenido_siniestro",
            value: ["Sí, como conductor de moto", "Sí, como pasajero de moto", "Sí, como peatón/otro vehículo"],
          },
        },
        {
          id: "siniestro_causas",
          type: "checkbox",
          text: "¿Qué factores crees que causaron el siniestro?",
          appliesTo: "all",
          showIf: {
            questionId: "ha_tenido_siniestro",
            value: ["Sí, como conductor de moto", "Sí, como pasajero de moto", "Sí, como peatón/otro vehículo"],
          },
          options: [
            "Exceso de velocidad",
            "Conductor ebrio o bajo efectos",
            "Uso del celular",
            "No respetar semáforo / señal",
            "Falla mecánica",
            "Mala condición de la vía",
            "Clima adverso",
            "Otro conductor",
            "Falta de visibilidad",
            "No estoy seguro",
          ],
        },
        {
          id: "siniestro_atencion",
          type: "radio",
          text: "Después del siniestro, ¿recibiste atención médica?",
          appliesTo: "all",
          showIf: {
            questionId: "ha_tenido_siniestro",
            value: ["Sí, como conductor de moto", "Sí, como pasajero de moto", "Sí, como peatón/otro vehículo"],
          },
          options: ["Sí, inmediata", "Sí, pero tardía", "No recibí atención", "No la necesité"],
        },
        {
          id: "familiar_relacion",
          type: "select",
          text: "¿Qué parentesco tienes con la víctima?",
          appliesTo: ["familiar"],
          options: ["Padre / Madre", "Hijo/a", "Esposo/a / Pareja", "Hermano/a", "Otro familiar", "Amigo/a cercano"],
        },
        {
          id: "familiar_siniestro_tipo",
          type: "radio",
          text: "El siniestro que afectó a tu familiar resultó en:",
          appliesTo: ["familiar"],
          required: true,
          options: ["Lesiones leves", "Lesiones graves / discapacidad", "Fallecimiento"],
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "percepcion",
      title: "7. Percepción de causas y medidas",
      description: "Tu opinión sobre las causas de los siniestros y qué medidas ayudarían.",
      icon: "Brain",
      appliesTo: "all",
      questions: [
        {
          id: "causas_principales",
          type: "checkbox",
          text: "¿Cuáles consideras que son las principales causas de siniestros de motocicleta en tu ciudad?",
          appliesTo: "all",
          required: true,
          options: [
            "Exceso de velocidad",
            "Conducir bajo efectos del alcohol",
            "Uso del celular",
            "Falta de capacitación / licencia",
            "Mala infraestructura vial",
            "Falta de señalización",
            "Conductores de otros vehículos",
            "Condición de las motocicletas",
            "Falta de cultura vial",
            "Presión laboral (delivery)",
          ],
        },
        {
          id: "medidas_efectivas",
          type: "checkbox",
          text: "¿Qué medidas crees que serían más efectivas para reducir los siniestros?",
          appliesTo: "all",
          required: true,
          options: [
            "Más controles policiales y alcoholemia",
            "Mayor y mejor educación vial",
            "Mejorar infraestructura (ciclorrutas, señalización)",
            "Endurecer sanciones y multas",
            "Capacitación obligatoria para motociclistas",
            "Controles técnicos vehiculares obligatorios",
            "Campañas de concientización",
            "Mejorar iluminación vial",
            "Regulación de apps de delivery",
            "Reducción de velocidad urbana",
          ],
        },
        {
          id: "efectividad_control",
          type: "scale",
          text: "¿Qué tan efectivo consideras el control actual de tránsito en tu ciudad?",
          appliesTo: "all",
          scaleMin: 1,
          scaleMax: 5,
          scaleLabels: { min: "Nada efectivo", max: "Muy efectivo" },
        },
        {
          id: "percepcion_seguridad",
          type: "scale",
          text: "¿Qué tan seguro te sientes (o te sentías) al conducir o transitar en motocicleta?",
          appliesTo: "all",
          scaleMin: 1,
          scaleMax: 5,
          scaleLabels: { min: "Muy inseguro", max: "Muy seguro" },
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "infraestructura",
      title: "8. Infraestructura vial",
      description: "Condiciones de las vías que usas.",
      icon: "Construction",
      appliesTo: "all",
      questions: [
        {
          id: "estado_vias",
          type: "scale",
          text: "¿Cómo calificas el estado general de las vías por donde conduces o transitas?",
          appliesTo: "all",
          scaleMin: 1,
          scaleMax: 5,
          scaleLabels: { min: "Muy malo", max: "Muy bueno" },
        },
        {
          id: "senalizacion",
          type: "scale",
          text: "¿La señalización vertical y horizontal es clara y visible?",
          appliesTo: "all",
          scaleMin: 1,
          scaleMax: 5,
          scaleLabels: { min: "Nada clara", max: "Muy clara" },
        },
        {
          id: "iluminacion",
          type: "radio",
          text: "¿La iluminación en las vías nocturnas es adecuada?",
          appliesTo: "all",
          options: ["Sí, en la mayoría", "Solo en algunas", "No, es deficiente", "No conduzco de noche"],
        },
        {
          id: "problemas_via",
          type: "checkbox",
          text: "¿Qué problemas de infraestructura identificas con más frecuencia?",
          appliesTo: "all",
          options: [
            "Huecos / baches",
            "Falta de señalización",
            "Señalización borrada / dañada",
            "Falta de iluminación",
            "Falta de ciclorruta",
            "Esquinas con visibilidad reducida",
            "Semiclós / reductores de velocidad mal diseñados",
            "Drenaje deficiente / charcos",
          ],
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "normativas",
      title: "9. Conocimiento de normativas",
      description: "Qué tanto conoces las normas de tránsito aplicables a motocicletas.",
      icon: "Scale",
      appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
      questions: [
        {
          id: "conoce_limites_velocidad",
          type: "radio",
          text: "¿Conoces los límites de velocidad para motocicletas en zona urbana?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          options: ["Sí, claramente", "Más o menos", "No los conozco"],
        },
        {
          id: "conoce_alcoholemia",
          type: "radio",
          text: "¿Conoces las normas sobre alcoholemia para conductores de motocicleta?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          options: ["Sí, claramente", "Más o menos", "No las conozco"],
        },
        {
          id: "conoce_sanciones",
          type: "radio",
          text: "¿Conoces las sanciones por no usar casco o por infracciones de tránsito?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          options: ["Sí, claramente", "Más o menos", "No las conozco"],
        },
        {
          id: "recibio_capacitacion",
          type: "radio",
          text: "¿Has recibido alguna capacitación formal en conducción de motocicleta?",
          appliesTo: ["motociclista_activo", "delivery", "mototaxista", "ex_motociclista"],
          options: ["Sí, en academia", "Sí, por la empresa / app", "Sí, informalmente", "No"],
        },
      ],
    },
    // --------------------------------------------------------------------------
    {
      id: "propuestas",
      title: "10. Propuestas de mejora",
      description: "Tus ideas para avanzar hacia Visión Cero.",
      icon: "Lightbulb",
      appliesTo: "all",
      questions: [
        {
          id: "propuesta_principal",
          type: "textarea",
          text: "¿Cuál consideras que es la acción más urgente para reducir los siniestros de motocicleta?",
          appliesTo: "all",
          required: true,
        },
        {
          id: "apoyo_vision_cero",
          type: "radio",
          text: "¿Apoyarías una política de 'Visión Cero' (ninguna muerte aceptable en vías)?",
          appliesTo: "all",
          options: ["Sí, totalmente", "Sí, en parte", "No estoy seguro", "No"],
        },
        {
          id: "disposicion_participar",
          type: "radio",
          text: "¿Estarías dispuesto a participar en campañas o capacitaciones de seguridad vial?",
          appliesTo: "all",
          options: ["Sí, seguro", "Tal vez", "No"],
        },
        {
          id: "comentario_final",
          type: "textarea",
          text: "¿Algún comentario o experiencia adicional que quieras compartir?",
          appliesTo: "all",
        },
      ],
    },
  ],
};

// ============================================================================
// UTILIDADES PARA FILTRADO CONDICIONAL
// ============================================================================

/** Devuelve las secciones que aplican a un tipo de conductor. */
export function getSectionsForDriverType(driverType: DriverTypeId): Section[] {
  return SURVEY.sections.filter(
    (s) => s.appliesTo === "all" || s.appliesTo.includes(driverType)
  );
}

/**
 * Devuelve las preguntas aplicables de una sección, filtrando por tipo de conductor
 * y por la lógica `showIf` (dependencia de respuestas previas).
 */
export function getActiveQuestions(
  section: Section,
  driverType: DriverTypeId,
  answers: Record<string, string | string[] | number>
): Question[] {
  return section.questions.filter((q) => {
    // Filtro por tipo de conductor
    if (q.appliesTo !== "all" && !q.appliesTo.includes(driverType)) return false;

    // Filtro por dependencia de respuesta previa (showIf)
    if (q.showIf) {
      const prev = answers[q.showIf.questionId];
      if (prev === undefined || prev === null || prev === "") return false;
      const required = q.showIf.value;
      const actual = String(prev);
      if (Array.isArray(required)) {
        if (!required.includes(actual)) return false;
      } else {
        if (actual !== required) return false;
      }
    }
    return true;
  });
}

/** Cuenta el total de preguntas activas para un tipo de conductor (sin dependencias). */
export function countQuestionsForDriverType(driverType: DriverTypeId): number {
  return getSectionsForDriverType(driverType).reduce(
    (acc, s) =>
      acc +
      s.questions.filter(
        (q) => q.appliesTo === "all" || q.appliesTo.includes(driverType)
      ).length,
    0
  );
}
