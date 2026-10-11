import { create } from "zustand";
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
}

const emptySorteo: SorteoData = {
  participa: false,
  nombre: "",
  cedula: "",
  telefono: "",
};

export const useSurveyStore = create<SurveyState>((set) => ({
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

  setView: (v) => set({ view: v }),
  setMode: (m) => set({ mode: m }),
  setAdminAuthed: (a) => set({ adminAuthed: a }),
  setAdminChecking: (c) => set({ adminChecking: c }),
  setDriverType: (d) => set({ driverType: d }),
  setAnswer: (id, v) =>
    set((s) => ({ answers: { ...s.answers, [id]: v } })),
  setMultiAnswer: (updates) =>
    set((s) => ({ answers: { ...s.answers, ...updates } })),
  clearAnswers: () =>
    set({ answers: {}, savedId: null, codigoSorteo: null, participaSorteo: false, sorteo: { ...emptySorteo } }),
  setSavedId: (id) => set({ savedId: id }),
  setSorteoResult: (codigo, participa) =>
    set({ codigoSorteo: codigo, participaSorteo: participa }),
  setSorteo: (s) => set((state) => ({ sorteo: { ...state.sorteo, ...s } })),
}));
