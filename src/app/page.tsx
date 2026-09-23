"use client";

import { useSurveyStore } from "@/store/survey-store";
import { Welcome } from "@/components/survey/welcome";
import { DriverTypeSelector } from "@/components/survey/driver-type-selector";
import { SurveyForm } from "@/components/survey/survey-form";
import { ThankYou } from "@/components/survey/thank-you";
import { Dashboard } from "@/components/dashboard/dashboard";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstitutionLogo, InstitutionBrand } from "@/components/institution-logo";
import { INSTITUTION } from "@/lib/institution";

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
            className="flex items-center gap-2.5 rounded-md"
            aria-label="Ir al inicio"
          >
            <InstitutionLogo size="sm" showName compact />
          </button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
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
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <InstitutionLogo size="sm" showName={false} />
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-foreground">
                {INSTITUTION.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {INSTITUTION.appTitle} · {INSTITUTION.appSubtitle}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Datos anónimos · Uso con fines de análisis y política pública
          </p>
        </div>
      </footer>
    </div>
  );
}
