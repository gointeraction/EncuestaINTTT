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
