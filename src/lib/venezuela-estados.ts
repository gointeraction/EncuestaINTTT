// ============================================================================
// Estados y Municipios de Venezuela
// ============================================================================
// 24 Estados + Distrito Capital + Dependencias Federales
// Fuente: división político-territorial oficial de Venezuela.
// ============================================================================

export interface Estado {
  nombre: string;
  capital: string;
  municipios: string[];
}

export const VENEZUELA_ESTADOS: Estado[] = [
  {
    nombre: "Distrito Capital",
    capital: "Caracas",
    municipios: ["Libertador"],
  },
  {
    nombre: "Amazonas",
    capital: "Puerto Ayacucho",
    municipios: ["Atures", "Atabapo", "Autana", "Casiquiare", "Guainía", "Maroa", "Río Negro"],
  },
  {
    nombre: "Anzoátegui",
    capital: "Barcelona",
    municipios: [
      "Anaco", "Aragua", "Diego Bautista Urbaneja", "Fernando de Peñalver",
      "Francisco del Carmen Carvajal", "General Artega", "General Bravo",
      "General Freites", "Guanta", "Independencia", "José Gregorio Monagas",
      "Juan Antonio Sotillo", "Juan Manuel Cajigal", "Libertad", "Miranda",
      "Peñalver", "Píritu", "San José de Guanipa", "Santa Ana", "Simón Bolívar",
      "Simón Rodríguez", "Sir Arthur Mc Gregor",
    ],
  },
  {
    nombre: "Apure",
    capital: "San Fernando",
    municipios: ["Achaguas", "Biruaca", "Muñoz", "Páez", "Pedro Camejo", "Rómulo Gallegos", "San Fernando"],
  },
  {
    nombre: "Aragua",
    capital: "Maracay",
    municipios: [
      "Atanasio Girardot", "Bolívar", "Camatagua", "Francisco Linares Alcántara",
      "Girardot", "José Ángel Lamas", "José Félix Ribas", "José Rafael Revenga",
      "Libertador", "Mario Briceño Iragorry", "Ocumare de la Costa de Oro",
      "San Casimiro", "San Sebastián", "Santiago Mariño", "Santos Michelena",
      "Sucre", "Tovar", "Urdaneta", "Zamora",
    ],
  },
  {
    nombre: "Barinas",
    capital: "Barinas",
    municipios: [
      "Alberto Arvelo Torrealba", "Andrés Eloy Blanco", "Antonio Nicolás Briceño",
      "Arismendi", "Barinas", "Bolívar", "Cruces", "Ezequiel Zamora", "Obispos",
      "Pedraza", "Rojas", "Sosa",
    ],
  },
  {
    nombre: "Bolívar",
    capital: "Ciudad Bolívar",
    municipios: [
      "Angostura", "Caroní", "Cedeño", "El Callao", "Gran Sabana", "Heres",
      "Padre Pedro Chien", "Piar", "Raúl Leoni", "Roscio", "Sifontes", "Sucre",
    ],
  },
  {
    nombre: "Carabobo",
    capital: "Valencia",
    municipios: [
      "Bejuma", "Carlos Arvelo", "Diego Ibarra", "Guacara", "Juan José Mora",
      "Libertador", "Los Guayos", "Miranda", "Montalbán", "Naguanagua",
      "Puerto Cabello", "San Diego", "San Joaquín", "Valencia",
    ],
  },
  {
    nombre: "Cojedes",
    capital: "San Carlos",
    municipios: [
      "Anzoátegui", "Antolín del Campo", "Falcón", "Girardot", "Lima Blanco",
      "Pao de San Juan Bautista", "Ricaurte", "Rómulo Gallegos", "San Carlos",
      "Tinaco", "Tinaquillo",
    ],
  },
  {
    nombre: "Delta Amacuro",
    capital: "Tucupita",
    municipios: ["Antonio Díaz", "Casacoima", "Pedernales", "Tucupita"],
  },
  {
    nombre: "Falcón",
    capital: "Coro",
    municipios: [
      "Acosta", "Bolívar", "Buchivacoa", "Cacique Manaure", "Carirubana",
      "Colina", "Falcón", "Jacura", "Los Taques", "Mauroa", "Miranda",
      "Monseñor Iturriza", "Petit", "Silva", "Sucre", "Tocopero", "Unión", "Zamora",
    ],
  },
  {
    nombre: "Guárico",
    capital: "San Juan de los Morros",
    municipios: [
      "Camaguán", "Chaguaramas", "El Socorro", "José Félix Ribas",
      "José Tadeo Monagas", "Juan Germán Roscio Nieves", "Julián Mellado",
      "Las Mercedes", "Leonardo Infante", "Ortiz", "Pedro Zaraza",
      "San Gerónimo de Guayabal", "San José de Guaribe", "Santa María de Ipire",
    ],
  },
  {
    nombre: "Lara",
    capital: "Barquisimeto",
    municipios: [
      "Andrés Eloy Blanco", "Crespo", "Iribarren", "Jiménez", "Morán",
      "Palavecino", "Simón Planas", "Torres", "Urdaneta",
    ],
  },
  {
    nombre: "Mérida",
    capital: "Mérida",
    municipios: [
      "Alberto Adriani", "Andrés Bello", "Antonio Pinto Salinas", "Aricagua",
      "Arzobispo Chacón", "Campos", "Caracciolo Parra Olmedo", "Cardenal Quintero",
      "Guaraque", "Julio César Salas", "Justo Briceño", "Libertador", "Miranda",
      "Obispo Ramos de Lora", "Padre Noguera", "Pueblo Llano", "Rangel",
      "Rivas Dávila", "Santos Marquina", "Sucre", "Tovar", "Tulio Febres Cordero", "Zea",
    ],
  },
  {
    nombre: "Miranda",
    capital: "Los Teques",
    municipios: [
      "Acevedo", "Andrés Bello", "Baruta", "Brión", "Buroz", "Carrizal",
      "Chacao", "Cristóbal Rojas", "El Hatillo", "Guaicaipuro", "Independencia",
      "Lander", "Los Salias", "Páez", "Paz Castillo", "Pedro Gual", "Placencia",
      "Simón Bolívar", "Sucre", "Urdaneta", "Zamora",
    ],
  },
  {
    nombre: "Monagas",
    capital: "Maturín",
    municipios: [
      "Acosta", "Aguasay", "Bolívar", "Caripe", "Cedeño", "Ezequiel Zamora",
      "Libertador", "Maturín", "Piar", "Punceres", "Santa Bárbara", "Sotillo", "Uracoa",
    ],
  },
  {
    nombre: "Nueva Esparta",
    capital: "La Asunción",
    municipios: [
      "Antolín del Campo", "Arismendi", "Díaz", "García", "Gómez", "Maneiro",
      "Mariño", "Marcano", "Península de Macanao", "Tubores", "Villalba",
    ],
  },
  {
    nombre: "Portuguesa",
    capital: "Guanare",
    municipios: [
      "Agua Blanca", "Araure", "Esteller", "Guanare", "Guanarito",
      "Monseñor José Vicente de Unda", "Ospino", "Páez", "Papelón",
      "San Genaro de Boconoíto", "San Rafael de Onoto", "Santa Rosalía", "Sucre", "Turén",
    ],
  },
  {
    nombre: "Sucre",
    capital: "Cumaná",
    municipios: [
      "Andrés Eloy Blanco", "Andrés Mata", "Arismendi", "Benítez", "Bermúdez",
      "Bolívar", "Cajigal", "Cruz Salmerón Acosta", "Libertador", "Mariño",
      "Mejía", "Montes", "Ribero", "Sucre", "Valdez",
    ],
  },
  {
    nombre: "Táchira",
    capital: "San Cristóbal",
    municipios: [
      "Andrés Bello", "Antonio Nicolás Briceño", "Ayacucho", "Bolívar", "Cárdenas",
      "Córdoba", "Fernández Feo", "Francisco de Miranda", "García de Hevia",
      "Guásimos", "Independencia", "Jáuregui", "José María Vargas", "Junín",
      "Libertad", "Libertador", "Lobatera", "Michelena", "Panamericano",
      "Pedro María Ureña", "Rafael Urdaneta", "Samuel Darío Maldonado",
      "San Cristóbal", "San Judas Tadeo", "Seboruco", "Simón Rodríguez", "Sucre",
      "Torbes", "Uribante",
    ],
  },
  {
    nombre: "Trujillo",
    capital: "Trujillo",
    municipios: [
      "Andrés Bello", "Boconó", "Bolívar", "Candelaria", "Carache", "Escuque",
      "José Felipe Márquez Cañizalez", "Juan Vicente Campo Elías", "La Ceiba",
      "Miranda", "Monte Carmelo", "Motatán", "Pampán", "Pampanito",
      "Rafael Rangel", "San Rafael de Carvajal", "Sucre", "Trujillo", "Urdaneta", "Valera",
    ],
  },
  {
    nombre: "La Guaira",
    capital: "La Guaira",
    municipios: [
      "Carayos", "Carlos Soublette", "Catia La Mar", "El Junko", "Guaicaipuro",
      "La Guaira", "Maiquetía", "Parroquia Caraballeda", "Raúl Leoni", "Urimare", "Vargas",
    ],
  },
  {
    nombre: "Yaracuy",
    capital: "San Felipe",
    municipios: [
      "Bolívar", "Bruzual", "Cocorote", "Independencia", "José Antonio Páez",
      "La Trinidad", "Manuel Monge", "Nirgua", "Peña", "San Felipe", "Sucre",
      "Urachiche", "Veroes",
    ],
  },
  {
    nombre: "Zulia",
    capital: "Maracaibo",
    municipios: [
      "Almirante Padilla", "Baralt", "Cabimas", "Catatumbo", "Colón",
      "Francisco Javier Pulgar", "Jesús Enrique Lossada", "Jesús María Semprún",
      "La Cañada de Urdaneta", "Lagunillas", "Machiques de Perijá", "Mara",
      "Maracaibo", "Guajira", "Rosario de Perijá", "San Francisco", "Santa Rita",
      "Simón Bolívar", "Sucre", "Valmore Rodríguez",
    ],
  },
  {
    nombre: "Dependencias Federales",
    capital: "Los Roques",
    municipios: ["Los Roques", "La Tortuga", "Los Monjes", "Los Testigos", "Las Aves", "Los Hermanos", "La Sola"],
  },
];

/** Lista simple de nombres de estados (para selects rápidos). */
export const ESTADO_NOMBRES: string[] = VENEZUELA_ESTADOS.map((e) => e.nombre);

/** Devuelve los municipios de un estado por nombre. */
export function getMunicipiosByEstado(estado: string): string[] {
  const e = VENEZUELA_ESTADOS.find((x) => x.nombre === estado);
  return e ? e.municipios : [];
}

/** Devuelve la capital de un estado. */
export function getCapitalByEstado(estado: string): string | undefined {
  const e = VENEZUELA_ESTADOS.find((x) => x.nombre === estado);
  return e?.capital;
}
