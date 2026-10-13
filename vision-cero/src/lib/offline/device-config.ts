export interface DeviceConfig {
  id: string;
  secret: string;
  channel: "kiosk" | "surveyor";
}

const KEY = "encuesta-vision-cero-device";

/** Configuración del dispositivo (kiosco/encuestador) guardada localmente tras el enrolamiento. */
export function getDevice(): DeviceConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DeviceConfig) : null;
  } catch {
    return null;
  }
}

export function setDevice(config: DeviceConfig): void {
  window.localStorage.setItem(KEY, JSON.stringify(config));
}

export function clearDevice(): void {
  window.localStorage.removeItem(KEY);
}

/**
 * Parsea un CÓDIGO DE ENROLAMIENTO pegado por el operador y devuelve la config, sin
 * guardarla. Acepta el enlace tal cual lo muestra Analytics → Dispositivos:
 *   `/?device=<id>&key=<secret>&channel=<kiosk|surveyor>`
 *   `http://host/?device=...&key=...&channel=...`
 *   `device=<id>&key=<secret>&channel=<kiosk|surveyor>`
 *   `<id>:<secret>:<kiosk|surveyor>`
 * Devuelve `null` si falta el dispositivo/clave o el canal no es válido.
 */
export function parseEnrollmentCode(code: string): DeviceConfig | null {
  const raw = (code ?? "").trim();
  if (!raw) return null;
  const query = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : raw;
  const params = new URLSearchParams(query);
  let id = params.get("device");
  let secret = params.get("key");
  let channel = params.get("channel") ?? params.get("canal");
  if ((!id || !secret) && raw.includes(":")) {
    const [i, s, c] = raw.split(":");
    id = id ?? (i || null);
    secret = secret ?? (s || null);
    channel = channel ?? (c || null);
  }
  if (!id || !secret) return null;
  if (channel !== "kiosk" && channel !== "surveyor") return null;
  return { id, secret, channel };
}

/**
 * Enrolamiento de un dispositivo: lee `?device=<id>&key=<secret>&channel=<kiosk|surveyor>`,
 * lo guarda localmente y LIMPIA las credenciales de la URL. Se llama una vez al abrir la app.
 */
export function enrollFromUrl(url?: string): DeviceConfig | null {
  if (typeof window === "undefined") return null;
  const u = new URL(url ?? window.location.href);
  const id = u.searchParams.get("device");
  const secret = u.searchParams.get("key");
  const channel = u.searchParams.get("channel");
  if (!id || !secret || (channel !== "kiosk" && channel !== "surveyor")) return null;
  const config: DeviceConfig = { id, secret, channel };
  setDevice(config);
  u.searchParams.delete("device");
  u.searchParams.delete("key");
  u.searchParams.delete("channel");
  window.history.replaceState({}, "", u.pathname + (u.search || "") + u.hash);
  return config;
}
