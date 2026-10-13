// ============================================================================
// Estados y Municipios de Venezuela
// ============================================================================
// 24 entidades federales (23 estados + Distrito Capital) · 335 municipios.
// Fuente: división político-territorial oficial (INE; Anexo:Municipios de Venezuela).
//
// Notas:
//   · "La Guaira" es el nombre actual del estado (antes "Vargas"); su ÚNICO
//     municipio es "Vargas".
//   · "Dependencias Federales" no tiene municipios.
//   · "Guayana Esequiba" (territorio en disputa) queda fuera de esta lista.
// ============================================================================

export interface Estado {
  nombre: string;
  capital: string;
  municipios: string[];
}

export const VENEZUELA_ESTADOS: Estado[] = [
  { nombre: "Amazonas", capital: "Puerto Ayacucho", municipios: [
    "Alto Orinoco", "Atabapo", "Atures", "Autana", "Manapiare", "Maroa", "Río Negro",
  ] },
  { nombre: "Anzoátegui", capital: "Barcelona", municipios: [
    "Anaco", "Aragua", "Simón Bolívar", "Manuel Ezequiel Bruzual", "Juan Manuel Cajigal",
    "Francisco del Carmen Carvajal", "Pedro María Freites", "Guanipa", "Guanta",
    "Independencia", "Libertad", "Sir Arthur Mc Gregor", "Francisco de Miranda",
    "José Gregorio Monagas", "Fernando de Peñalver", "Píritu", "San Juan de Capistrano",
    "Santa Ana", "Simón Rodríguez", "Sotillo", "Diego Bautista Urbaneja",
  ] },
  { nombre: "Apure", capital: "San Fernando de Apure", municipios: [
    "Achaguas", "Biruaca", "Pedro Camejo", "Muñoz", "Páez", "Rómulo Gallegos", "San Fernando",
  ] },
  { nombre: "Aragua", capital: "Maracay", municipios: [
    "Francisco Linares Alcántara", "Bolívar", "Camatagua", "Girardot",
    "Mario Briceño Iragorry", "José Ángel Lamas", "Libertador", "Santiago Mariño",
    "Santos Michelena", "Ocumare de la Costa de Oro", "José Rafael Revenga",
    "José Félix Ribas", "San Casimiro", "San Sebastián", "Sucre", "Tovar", "Urdaneta",
    "Zamora",
  ] },
  { nombre: "Barinas", capital: "Barinas", municipios: [
    "Alberto Arvelo Torrealba", "Andrés Eloy Blanco", "Antonio José de Sucre", "Arismendi",
    "Barinas", "Bolívar", "Cruz Paredes", "Ezequiel Zamora", "Obispos", "Pedraza", "Rojas",
    "Sosa",
  ] },
  { nombre: "Bolívar", capital: "Ciudad Bolívar", municipios: [
    "Angostura", "Angostura del Orinoco", "Caroní", "Cedeño", "Padre Pedro Chien", "El Callao",
    "Gran Sabana", "Piar", "Roscio", "Sifontes", "Sucre",
  ] },
  { nombre: "Carabobo", capital: "Valencia", municipios: [
    "Bejuma", "Carlos Arvelo", "Diego Ibarra", "Guacara", "Juan José Mora", "Libertador",
    "Los Guayos", "Miranda", "Montalbán", "Naguanagua", "Puerto Cabello", "San Diego",
    "San Joaquín", "Valencia",
  ] },
  { nombre: "Cojedes", capital: "San Carlos", municipios: [
    "Anzoátegui", "San Carlos", "Girardot", "Lima Blanco", "Pao de San Juan Bautista",
    "Ricaurte", "Rómulo Gallegos", "Tinaco", "Tinaquillo",
  ] },
  { nombre: "Delta Amacuro", capital: "Tucupita", municipios: [
    "Antonio Díaz", "Casacoima", "Pedernales", "Tucupita",
  ] },
  { nombre: "Distrito Capital", capital: "Caracas", municipios: ["Libertador"] },
  { nombre: "Falcón", capital: "Coro", municipios: [
    "Acosta", "Bolívar", "Buchivacoa", "Carirubana", "Colina", "Dabajuro", "Democracia",
    "Falcón", "Federación", "Monseñor Iturriza", "Jacura", "Los Taques", "Manaure", "Mauroa",
    "Miranda", "Palmasola", "Petit", "Píritu", "San Francisco", "Sucre", "Silva", "Tocópero",
    "Unión", "Urumaco", "Zamora",
  ] },
  { nombre: "Guárico", capital: "San Juan de los Morros", municipios: [
    "Camaguán", "Chaguaramas", "El Socorro", "Francisco de Miranda", "José Félix Ribas",
    "José Tadeo Monagas", "Juan Germán Roscio", "Juan José Rondón", "Julián Mellado",
    "Leonardo Infante", "Ortiz", "San Gerónimo de Guayabal", "San José de Guaribe",
    "Santa María de Ipire", "Zaraza",
  ] },
  { nombre: "La Guaira", capital: "La Guaira", municipios: ["Vargas"] },
  { nombre: "Lara", capital: "Barquisimeto", municipios: [
    "Andrés Eloy Blanco", "Crespo", "Iribarren", "Jiménez", "Morán", "Palavecino", "Planas",
    "Torres", "Urdaneta",
  ] },
  { nombre: "Mérida", capital: "Mérida", municipios: [
    "Alberto Adriani", "Andrés Bello", "Antonio Pinto Salinas", "Aricagua", "Arzobispo Chacón",
    "Campo Elías", "Caracciolo Parra Olmedo", "Cardenal Quintero", "Guaraque",
    "Julio César Salas", "Justo Briceño", "Libertador", "Miranda", "Obispo Ramos de Lora",
    "Padre Noguera", "Pueblo Llano", "Rangel", "Rivas Dávila", "Santos Marquina", "Sucre",
    "Tovar", "Tulio Febres Cordero", "Zea",
  ] },
  { nombre: "Miranda", capital: "Los Teques", municipios: [
    "Acevedo", "Andrés Bello", "Baruta", "Bolívar", "Brión", "Buroz", "Carrizal", "Chacao",
    "Cristóbal Rojas", "El Hatillo", "Guaicaipuro", "Gual", "Independencia", "Lander",
    "Los Salias", "Páez", "Paz Castillo", "Plaza", "Sucre", "Urdaneta", "Zamora",
  ] },
  { nombre: "Monagas", capital: "Maturín", municipios: [
    "Acosta", "Aguasay", "Bolívar", "Caripe", "Cedeño", "Libertador", "Maturín", "Piar",
    "Punceres", "Santa Bárbara", "Sotillo", "Uracoa", "Zamora",
  ] },
  { nombre: "Nueva Esparta", capital: "La Asunción", municipios: [
    "Antolín del Campo", "Antonio Díaz", "Arismendi", "García", "Gómez",
    "Península de Macanao", "Maneiro", "Marcano", "Mariño", "Tubores", "Villalba",
  ] },
  { nombre: "Portuguesa", capital: "Guanare", municipios: [
    "Agua Blanca", "Araure", "Esteller", "Guanare", "Guanarito",
    "Monseñor José Vicente de Unda", "Ospino", "Páez", "Papelón", "San Genaro de Boconoíto",
    "San Rafael de Onoto", "Santa Rosalía", "Sucre", "Turén",
  ] },
  { nombre: "Sucre", capital: "Cumaná", municipios: [
    "Andrés Eloy Blanco", "Andrés Mata", "Arismendi", "Benítez", "Bermúdez", "Bolívar",
    "Cajigal", "Cruz Salmerón Acosta", "Libertador", "Mariño", "Mejía", "Montes", "Ribero",
    "Sucre", "Valdez",
  ] },
  { nombre: "Táchira", capital: "San Cristóbal", municipios: [
    "Andrés Bello", "Rómulo Costa", "Ayacucho", "Bolívar", "Cárdenas", "Córdoba",
    "Fernández Feo", "Francisco de Miranda", "García de Hevia", "Guásimos", "Independencia",
    "Jáuregui", "Vargas", "Junín", "Libertad", "Libertador", "Lobatera", "Michelena",
    "Panamericano", "Ureña", "Urdaneta", "Maldonado", "San Cristóbal", "San Judas Tadeo",
    "Seboruco", "Simón Rodríguez", "Sucre", "Torbes", "Uribante",
  ] },
  { nombre: "Trujillo", capital: "Trujillo", municipios: [
    "Andrés Bello", "Boconó", "Bolívar", "Candelaria", "Carache", "San Rafael de Carvajal",
    "Escuque", "Juan Vicente Campos Elías", "La Ceiba", "José Felipe Márquez Cañizales",
    "Miranda", "Monte Carmelo", "Motatán", "Pampán", "Pampanito", "Rafael Rangel", "Sucre",
    "Trujillo", "Urdaneta", "Valera",
  ] },
  { nombre: "Yaracuy", capital: "San Felipe", municipios: [
    "Arístides Bastidas", "Bolívar", "Bruzual", "Cocorote", "Independencia",
    "José Antonio Páez", "La Trinidad", "Manuel Monge", "Nirgua", "Peña", "San Felipe",
    "Sucre", "Urachiche", "Veroes",
  ] },
  { nombre: "Zulia", capital: "Maracaibo", municipios: [
    "Almirante Padilla", "Baralt", "Cabimas", "Catatumbo", "Colón", "Francisco Javier Pulgar",
    "Guajira", "Jesús Enrique Lossada", "Jesús María Semprún", "La Cañada de Urdaneta",
    "Lagunillas", "Machiques de Perijá", "Mara", "Maracaibo", "Miranda", "Rosario de Perijá",
    "San Francisco", "Santa Rita", "Bolívar", "Sucre", "Valmore Rodríguez",
  ] },
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
