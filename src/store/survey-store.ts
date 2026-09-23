import { create } from "zustand";
import type { DriverTypeId } from "@/lib/survey-data";

export type AnswerValue = string | string[] | number;

export type View = "welcome" | "driver" | "survey" | "sorteo" | "thanks" | "dashboard";

export interface SorteoData {
  participa: boolean;
  nombre: string;
  cedula: string;
  telefono: string;
}

interface SurveyState {
  view: View;
  driverType: DriverTypeId | null;
  answers: Record<string, AnswerValue>;
  savedId: string | null;
  codigoSorteo: string | null;
  participaSorteo: boolean;
  sorteo: SorteoData;

  setView: (v: View) => void;
  setDriverType: (d: DriverTypeId) => void;
  setAnswer: (id: string, v: AnswerValue) => void;
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
  driverType: null,
  answers: {},
  savedId: null,
  codigoSorteo: null,
  participaSorteo: false,
  sorteo: { ...emptySorteo },

  setView: (v) => set({ view: v }),
  setDriverType: (d) => set({ driverType: d }),
  setAnswer: (id, v) =>
    set((s) => ({ answers: { ...s.answers, [id]: v } })),
  clearAnswers: () =>
    set({ answers: {}, savedId: null, codigoSorteo: null, participaSorteo: false, sorteo: { ...emptySorteo } }),
  setSavedId: (id) => set({ savedId: id }),
  setSorteoResult: (codigo, participa) =>
    set({ codigoSorteo: codigo, participaSorteo: participa }),
  setSorteo: (s) => set((state) => ({ sorteo: { ...state.sorteo, ...s } })),
}));
