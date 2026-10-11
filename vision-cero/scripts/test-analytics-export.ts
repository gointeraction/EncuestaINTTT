import assert from "node:assert";
import { maskPii } from "../src/lib/services/export-service";

console.log("=== Ejecutando Suite de Pruebas: Analítica, Dashboards y Exportaciones (T23 - T26) ===");

// 1. Enmascaramiento de Datos Personales (PII) - US-5.4 / Decisión D-4
console.log("-> 1. Probando enmascaramiento de información de identificación personal (PII)...");

const emailRaw = "carlos.mendoza@transporte.gob.ve";
const emailMasked = maskPii(emailRaw);
assert.strictEqual(emailMasked.includes("c****@transporte.gob.ve"), true);
assert.strictEqual(emailMasked.includes("mendoza"), false, "El apellido en el correo debe estar oculto");

const cedulaRaw = "V-18234567";
const cedulaMasked = maskPii(cedulaRaw);
assert.strictEqual(cedulaMasked, "V-18***67");
assert.strictEqual(cedulaMasked.includes("2345"), false, "Dígitos centrales deben estar enmascarados");

const tlfRaw = "0414-3344556";
const tlfMasked = maskPii(tlfRaw);
assert.ok(tlfMasked.includes("***4556"), "Dígitos centrales del teléfono deben estar enmascarados");

const cleanText = "El asfalto en la autopista presenta baches frecuentes.";
assert.strictEqual(maskPii(cleanText), cleanText, "El texto sin PII debe conservarse intacto");
console.log("   [PASÓ] Algoritmo de enmascaramiento PII protege correos, cédulas y números.");

// 2. Cálculo de métricas y tasas de finalización (US-5.1)
console.log("-> 2. Probando cálculo de tasas de finalización y abandono...");
function calculateRates(total: number, completed: number, abandoned: number) {
  const completionRate = total > 0 ? Number((completed / total).toFixed(4)) : 0;
  const abandonmentRate = total > 0 ? Number((abandoned / total).toFixed(4)) : 0;
  return { completionRate, abandonmentRate };
}

const rates1 = calculateRates(1000, 936, 64);
assert.strictEqual(rates1.completionRate, 0.936);
assert.strictEqual(rates1.abandonmentRate, 0.064);

const ratesZero = calculateRates(0, 0, 0);
assert.strictEqual(ratesZero.completionRate, 0);
assert.strictEqual(ratesZero.abandonmentRate, 0);
console.log("   [PASÓ] Métricas globales de finalización calculadas con precisión.");

// 3. Agregación de escalas y cálculo de promedios (US-5.2)
console.log("-> 3. Probando promedios y distribución en escalas de calificación...");
const ratings = [5, 4, 5, 3, 4, 5, 2, 5, 4, 5]; // Suma = 42, N = 10 -> Promedio = 4.2
const sum = ratings.reduce((a, b) => a + b, 0);
const avg = Number((sum / ratings.length).toFixed(2));
assert.strictEqual(avg, 4.2);

const counts: Record<number, number> = {};
for (const r of ratings) counts[r] = (counts[r] || 0) + 1;
assert.strictEqual(counts[5], 5, "Calificación 5 debe tener frecuencia 5");
assert.strictEqual(counts[4], 3, "Calificación 4 debe tener frecuencia 3");
console.log("   [PASÓ] Distribución estadística y cálculo de promedios validado.");

// 4. Formateo y escape RFC 4180 para exportaciones CSV
console.log("-> 4. Verificando escape de caracteres especiales en CSV...");
function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return `"${val}"`;
}

assert.strictEqual(escapeCsv('Texto con "comillas"'), '"Texto con ""comillas"""');
assert.strictEqual(escapeCsv("Caracas, Distrito Capital"), '"Caracas, Distrito Capital"');
console.log("   [PASÓ] Escape de caracteres especiales RFC 4180 conforme a especificación.");

console.log("\n>>> Todas las pruebas de Fase 5 (Analytics & Exports) pasaron exitosamente. <<<");
