import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "./idb-storage";

/** Entrevista FINALIZADA pendiente de transmitir. */
export interface OutboxEntry {
  clientSubmissionId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface OutboxState {
  entries: OutboxEntry[];
  enqueue: (entry: OutboxEntry) => void;
  remove: (clientSubmissionId: string) => void;
}

/** Outbox persistente (IndexedDB): entrevistas completas que no pudieron enviarse. */
export const useOutbox = create<OutboxState>()(
  persist(
    (set) => ({
      entries: [],
      enqueue: (entry) =>
        set((s) =>
          s.entries.some((e) => e.clientSubmissionId === entry.clientSubmissionId)
            ? s
            : { entries: [...s.entries, entry] },
        ),
      remove: (clientSubmissionId) =>
        set((s) => ({ entries: s.entries.filter((e) => e.clientSubmissionId !== clientSubmissionId) })),
    }),
    { name: "encuesta-vision-cero-outbox", storage: createJSONStorage(() => idbStorage) },
  ),
);

export interface FlushResult {
  sent: number;
  pending: number;
}

/**
 * Intenta transmitir el outbox. 2xx/4xx → se quita (enviado o permanente); error de red/5xx
 * → se conserva para reintentar. Devuelve cuántos se enviaron y cuántos quedan.
 */
export async function flushOutbox(): Promise<FlushResult> {
  const { entries, remove } = useOutbox.getState();
  let sent = 0;
  for (const entry of entries) {
    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry.payload),
      });
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        remove(entry.clientSubmissionId);
        sent++;
      }
      // 5xx → se conserva
    } catch {
      // error de red → se conserva
    }
  }
  return { sent, pending: useOutbox.getState().entries.length };
}
