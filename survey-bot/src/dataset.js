// ============================================================================
// Carga del dataset del seed (CSV) — data, no código de la app.
// Columnas: id,driverType,answers(JSON),completedAt,capturedAt,participaSorteo,
//           nombre,cedula,telefono,codigoSorteo,channel,device_id,survey_id
// ============================================================================
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Parser CSV RFC4180 (comillas, comas y saltos embebidos). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Devuelve los archivos CSV de una carpeta (o el archivo mismo). */
function csvFiles(path) {
  const st = statSync(path);
  if (st.isDirectory()) {
    return readdirSync(path)
      .filter((f) => f.toLowerCase().endsWith(".csv"))
      .sort()
      .map((f) => join(path, f));
  }
  return [path];
}

/** Carga TODOS los registros del dataset, normalizados. */
export function loadRecords(datasetPath) {
  const records = [];
  for (const file of csvFiles(datasetPath)) {
    const rows = parseCsv(readFileSync(file, "utf8"));
    const header = rows.shift();
    if (!header) continue;
    for (const r of rows) {
      if (!r.length || (r.length === 1 && r[0] === "")) continue;
      const obj = {};
      header.forEach((h, i) => (obj[h] = r[i]));
      try {
        obj.answers = JSON.parse(obj.answers || "{}");
      } catch {
        obj.answers = {};
      }
      obj.participaSorteo = /^(t|true|1|sí|si)$/i.test(String(obj.participaSorteo || ""));
      records.push(obj);
    }
  }
  return records;
}

/** Etiqueta visible del perfil a partir del id del dataset (data propia del bot). */
export const DRIVER_LABEL = {
  motociclista_activo: "Motociclista activo",
  delivery: "Delivery / Mensajero",
  mototaxista: "Mototaxista",
  ex_motociclista: "Ex motociclista",
  familiar: "Familiar de víctima",
  otro_conductor: "Otro conductor / peatón",
};
