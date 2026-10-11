import { get, set, del } from "idb-keyval";

/**
 * Storage de zustand `persist` respaldado por IndexedDB (idb-keyval).
 * Permite reanudar el borrador y conservar el OUTBOX aunque se recargue/cierre la app.
 * Es client-only: se accede de forma perezosa (createJSONStorage) para no romper el SSR.
 */
export const idbStorage = {
  getItem: async (name: string): Promise<string | null> => (await get(name)) ?? null,
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};
