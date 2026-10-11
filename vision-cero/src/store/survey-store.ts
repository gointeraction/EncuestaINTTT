import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "@/lib/offline/idb-storage";
import type { DriverTypeId } from "@/lib/survey-data";

export type AnswerValue = string | string[] | number;

export type View = "welcome" | "driver" | "survey" | "sorteo" | "thanks" | "dashboard";

/** Modo de la app: público (encuesta) o admin (dashboard privado). */
export type AppMode = "public" | "admin";

export interface SorteoData {
  participa: boolean;
  nombre: string;
  cedula: string;
  telefono: string;
}

interface SurveyState {
  view: View;
  mode: AppMode;
  adminAuthed: boolean;
  adminChecking: boolean;
  driverType: DriverTypeId | null;
  answers: Record<string, AnswerValue>;
  savedId: string | null;
  codigoSorteo: string | null;
  participaSorteo: boolean;
  sorteo: SorteoData;
  /** Idempotencia: id estable por entrevista (se conserva en el borrador). */
  clientSubmissionId: string | null;

  setView: (v: View) => void;
  setMode: (m: AppMode) => void;
  setAdminAuthed: (a: boolean) => void;
  setAdminChecking: (c: boolean) => void;
  setDriverType: (d: DriverTypeId) => void;
  setAnswer: (id: string, v: AnswerValue) => void;
  setMultiAnswer: (updates: Record<string, AnswerValue>) => void;
  clearAnswers: () => void;
  setSavedId: (id: string) => void;
  setSorteoResult: (codigo: string | null, participa: boolean) => void;
  setSorteo: (s: Partial<SorteoData>) => void;
  ensureSubmissionId: () => string;
}

const emptySorteo: SorteoData = {
  participa: false,
  nombre: "",
  cedula: "",
  telefono: "",
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      view: "welcome",
      mode: "public",
      adminAuthed: false,
      adminChecking: true,
      driverType: null,
      answers: {},
      savedId: null,
      codigoSorteo: null,
      participaSorteo: false,
      sorteo: { ...emptySorteo },
      clientSubmissionId: null,

      setView: (v) => set({ view: v }),
      setMode: (m) => set({ mode: m }),
      setAdminAuthed: (a) => set({ adminAuthed: a }),
      setAdminChecking: (c) => set({ adminChecking: c }),
      setDriverType: (d) => set({ driverType: d }),
      setAnswer: (id, v) => set((s) => ({ answers: { ...s.answers, [id]: v } })),
      setMultiAnswer: (updates) => set((s) => ({ answers: { ...s.answers, ...updates } })),
      clearAnswers: () =>
        set({
          answers: {},
          savedId: null,
          codigoSorteo: null,
          participaSorteo: false,
          sorteo: { ...emptySorteo },
          clientSubmissionId: null,
        }),
      setSavedId: (id) => set({ savedId: id }),
      setSorteoResult: (codigo, participa) => set({ codigoSorteo: codigo, participaSorteo: participa }),
      setSorteo: (s) => set((state) => ({ sorteo: { ...state.sorteo, ...s } })),
      ensureSubmissionId: () => {
        const current = get().clientSubmissionId;
        if (current) return current;
        const id = newId();
        set({ clientSubmissionId: id });
        return id;
      },
    }),
    {
      name: "encuesta-vision-cero",
      storage: createJSONStorage(() => idbStorage),
      // Solo el borrador de la entrevista (no los flags de admin).
      partialize: (s) => ({
        view: s.view,
        mode: s.mode,
        driverType: s.driverType,
        answers: s.answers,
        savedId: s.savedId,
        codigoSorteo: s.codigoSorteo,
        participaSorteo: s.participaSorteo,
        sorteo: s.sorteo,
        clientSubmissionId: s.clientSubmissionId,
      }),
    },
  ),
);
