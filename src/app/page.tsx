"use client";

import { useSurveyStore } from "@/store/survey-store";
import { Welcome } from "@/components/survey/welcome";
import { DriverTypeSelector } from "@/components/survey/driver-type-selector";
import { SurveyForm } from "@/components/survey/survey-form";
import { SorteoForm } from "@/components/survey/sorteo-form";
import { ThankYou } from "@/components/survey/thank-you";
import { Dashboard } from "@/components/dashboard/dashboard";
import { BarChart3, ClipboardList, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstitutionLogo } from "@/components/institution-logo";
import { INSTITUTION } from "@/lib/institution";

export default function Home() {
  const view = useSurveyStore((s) => s.view);
  const setView = useSurveyStore((s) => s.setView);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* --- barra superior gov (delgada, navy profundo) --- */}
      <div className="intt-navy-bg text-white">
        <div className="mx-auto flex h-7 max-w-6xl items-center justify-between px-4 text-[11px]">
          <span className="hidden sm:inline">
            {INSTITUTION.ministry}
          </span>
          <a
            href={INSTITUTION.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/80 transition-colors hover:text-white"
          >
            {INSTITUTION.website.replace("https://www.", "")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* --- header principal (navy) --- */}
      <header className="intt-navy-gradient sticky top-0 z-30 border-b border-white/10 shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button
            onClick={() => setView("welcome")}
            className="flex items-center gap-3 rounded-md transition-opacity hover:opacity-90"
            aria-label="Ir al inicio"
          >
            <InstitutionLogo size="sm" variant="light" />
          </button>

          <nav className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("welcome")}
              className={
                view === "welcome" || view === "driver" || view === "survey" || view === "sorteo" || view === "thanks"
                  ? "text-white hover:bg-white/10"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }
            >
              <ClipboardList className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Encuesta</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setView("dashboard")}
              className={
                view === "dashboard"
                  ? "bg-[var(--intt-gold)] text-[var(--intt-navy-deep)] hover:bg-[var(--intt-gold-deep)] hover:text-[var(--intt-navy-deep)]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }
            >
              <BarChart3 className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* --- main content --- */}
      <main className="flex-1">
        {view === "welcome" && <Welcome />}
        {view === "driver" && <DriverTypeSelector />}
        {view === "survey" && <SurveyForm />}
        {view === "sorteo" && <SorteoForm />}
        {view === "thanks" && <ThankYou />}
        {view === "dashboard" && <Dashboard />}
      </main>

      {/* --- sticky footer institucional --- */}
      <footer className="intt-navy-bg mt-auto text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3">
              <InstitutionLogo size="md" variant="light" />
              <div className="max-w-xs text-xs leading-relaxed text-white/70">
                <p className="font-semibold text-white">{INSTITUTION.name}</p>
                <p className="mt-0.5">{INSTITUTION.ministry}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <p className="font-semibold uppercase tracking-wider text-[var(--intt-gold)]">
                {INSTITUTION.appTitle}
              </p>
              <p className="text-white/70">{INSTITUTION.appSubtitle}</p>
              <p className="max-w-xs text-white/50">
                Encuesta de percepción y propuestas. Datos anónimos, con fines
                de análisis y política pública.
              </p>
            </div>
          </div>

          {/* regla dorada */}
          <div className="intt-gold-rule mt-6 h-0.5 w-full rounded-full opacity-60" />

          <div className="mt-4 flex flex-col items-center justify-between gap-2 text-[11px] text-white/50 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {INSTITUTION.shortName} · Todos los derechos reservados
            </p>
            <a
              href={INSTITUTION.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-white"
            >
              {INSTITUTION.website.replace("https://www.", "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
