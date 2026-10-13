// ============================================================================
// Verifica la integridad de la lista territorial oficial de Venezuela:
// 24 entidades federales (23 estados + Distrito Capital) · 335 municipios.
// Falla (exit 1) si los conteos cambian (p. ej. La Guaira debe tener 1: Vargas).
// Uso: npm run check:geo
// ============================================================================
import { VENEZUELA_ESTADOS } from "../src/lib/venezuela-estados";

const total = VENEZUELA_ESTADOS.reduce((s, e) => s + e.municipios.length, 0);
const laGuaira = VENEZUELA_ESTADOS.find((e) => e.nombre === "La Guaira");
const errors: string[] = [];

if (VENEZUELA_ESTADOS.length !== 24) {
  errors.push(`entidades: se esperaban 24, hay ${VENEZUELA_ESTADOS.length}`);
}
if (total !== 335) {
  errors.push(`municipios: se esperaban 335, hay ${total}`);
}
if (!laGuaira || laGuaira.municipios.length !== 1 || laGuaira.municipios[0] !== "Vargas") {
  errors.push(`La Guaira debe tener 1 municipio ("Vargas"); tiene: ${JSON.stringify(laGuaira?.municipios)}`);
}
if (VENEZUELA_ESTADOS.some((e) => e.nombre === "Vargas")) {
  errors.push(`"Vargas" no debe figurar como estado (es el municipio de La Guaira)`);
}
if (VENEZUELA_ESTADOS.some((e) => e.nombre === "Dependencias Federales")) {
  errors.push(`"Dependencias Federales" no tiene municipios y no debe listarse como estado`);
}
if (new Set(VENEZUELA_ESTADOS.map((e) => e.nombre)).size !== VENEZUELA_ESTADOS.length) {
  errors.push(`hay nombres de estado duplicados`);
}

if (errors.length) {
  console.error("✗ Lista territorial inválida:\n - " + errors.join("\n - "));
  process.exit(1);
}
console.log(`✓ Lista territorial OK: ${VENEZUELA_ESTADOS.length} entidades, ${total} municipios`);
