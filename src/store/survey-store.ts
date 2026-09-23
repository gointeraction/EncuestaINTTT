import { create } from "zustand";
import type { DriverTypeId } from "@/lib/survey-data";

export type AnswerValue = string | string[] | number;

export type View = "welcome" | "driver" | "survey" | "thanks" | "dashboard";

interface SurveyState {
  view: View;
  driverType: DriverTypeId | null;
  answers: Record<string, AnswerValue>;
  savedId: string | null;

  setView: (v: View) => void;
  setDriverType: (d: DriverTypeId) => void;
  setAnswer: (id: string, v: AnswerValue) => void;
  clearAnswers: () => void;
  setSavedId: (id: string) => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  view: "welcome",
  driverType: null,
  answers: {},
  savedId: null,

  setView: (v) => set({ view: v }),
  setDriverType: (d) => set({ driverType: d }),
  setAnswer: (id, v) =>
    set((s) => ({ answers: { ...s.answers, [id]: v } })),
  clearAnswers: () => set({ answers: {}, savedId: null }),
  setSavedId: (id) => set({ savedId: id }),
}));
