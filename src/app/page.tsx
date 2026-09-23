"use client";

import { useSurveyStore } from "@/store/survey-store";
import { Welcome } from "@/components/survey/welcome";
import { DriverTypeSelector } from "@/components/survey/driver-type-selector";
import { SurveyForm } from "@/components/survey/survey-form";
import { ThankYou } from "@/components/survey/thank-you";
import { Dashboard } from "@/components/dashboard/dashboard";
import { ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const view = useSurveyStore((s) => s.view);
  const setView = useSurveyStore((s) => s.setView);

  return (
    <div className="flex min-h-screen flex-col">
      {/* --- header --- */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <button
            onClick={() => setView("welcome")}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Visión Cero</span>
            <span className="text-xs font-normal text-muted-foreground">· Encuesta</span>
          </button>
          <div className="flex items-center gap-1">
            <Button
              variant={view === "welcome" || view === "driver" || view === "survey" || view === "thanks" ? "ghost" : "ghost"}
              size="sm"
              onClick={() => setView("welcome")}
            >
              Encuesta
            </Button>
            <Button
              variant={view === "dashboard" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("dashboard")}
            >
              <BarChart3 className="mr-1 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* --- main content --- */}
      <main className="flex-1">
        {view === "welcome" && <Welcome />}
        {view === "driver" && <DriverTypeSelector />}
        {view === "survey" && <SurveyForm />}
        {view === "thanks" && <ThankYou />}
        {view === "dashboard" && <Dashboard />}
      </main>

      {/* --- sticky footer --- */}
      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
          <p>
            Visión Cero en Siniestros de Motocicletas · Encuesta de percepción y propuestas
          </p>
          <p className="mt-1">
            Datos anónimos · Uso con fines de análisis y política pública
          </p>
        </div>
      </footer>
    </div>
  );
}
