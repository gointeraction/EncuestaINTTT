"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Bike, BarChart3, ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSurveyStore } from "@/store/survey-store";
import { countQuestionsForDriverType } from "@/lib/survey-data";
import { INSTITUTION } from "@/lib/institution";

export function Welcome() {
  const setView = useSurveyStore((s) => s.setView);

  return (
    <div>
      {/* ====================================================
          HERO institucional (estilo intt-hero)
          ==================================================== */}
      <section className="intt-hero-bg relative overflow-hidden border-b border-[var(--intt-gris-200)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* pill institucional */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--intt-electric-50)] px-3 py-1 text-xs font-semibold text-[var(--intt-electric-deep)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                {INSTITUTION.name}
              </div>

              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[var(--intt-navy-deep)] sm:text-5xl lg:text-[2.75rem]">
                Hacia una{" "}
                <span className="relative whitespace-nowrap text-[var(--intt-electric)]">
                  Visión Cero
                  <span className="intt-gold-rule absolute -bottom-1 left-0 h-1 w-full rounded-full" />
                </span>
                <br />
                en Siniestros de Motocicletas
              </h1>

              <p className="mt-5 max-w-xl text-base text-[var(--intt-gris-700)] sm:text-lg">
                Esta encuesta recoge tu experiencia, percepciones y propuestas
                para reducir los siniestros de motocicleta. Las preguntas se{" "}
                <strong className="text-[var(--intt-navy-deep)]">
                  adaptan automáticamente a tu tipo de conductor
                </strong>
                , para que solo respondas lo que aplica a tu perfil.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="bg-[var(--intt-electric)] text-white hover:bg-[var(--intt-electric-deep)]"
                  onClick={() => setView("driver")}
                >
                  Comenzar encuesta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[var(--intt-navy)] text-[var(--intt-navy-deep)] hover:bg-[var(--intt-electric-50)]"
                  onClick={() => setView("dashboard")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver dashboard
                </Button>
              </div>

              <p className="mt-5 text-xs text-[var(--intt-gris-500)]">
                Tiempo estimado: 8–12 minutos · Hasta{" "}
                {countQuestionsForDriverType("delivery")} preguntas según tu perfil
              </p>
            </motion.div>

            {/* tarjeta visual derecha */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <div className="intt-shadow-lg overflow-hidden rounded-2xl border border-[var(--intt-gris-200)] bg-white">
                <div className="intt-navy-gradient flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--intt-gold)]">
                      {INSTITUTION.shortName} · {INSTITUTION.appTitle}
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {INSTITUTION.appSubtitle}
                    </p>
                  </div>
                  <ClipboardCheck className="h-7 w-7 text-[var(--intt-gold)]" />
                </div>
                <div className="space-y-3 p-5">
                  {[
                    { icon: Bike, t: "Preguntas adaptadas", d: "Detectamos tu perfil y filtramos las preguntas." },
                    { icon: ShieldCheck, t: "Confidencial", d: "Respuestas anónimas, solo análisis." },
                    { icon: BarChart3, t: "Dashboard público", d: "Resultados en panel interactivo." },
                  ].map((f) => (
                    <div key={f.t} className="flex items-start gap-3 rounded-lg border border-[var(--intt-gris-200)] p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--intt-electric-50)]">
                        <f.icon className="h-4 w-4 text-[var(--intt-electric)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--intt-navy-deep)]">{f.t}</p>
                        <p className="text-xs text-[var(--intt-gris-700)]">{f.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================
          Tarjetas de características (mobile visible)
          ==================================================== */}
      <section className="mx-auto max-w-6xl px-4 py-12 lg:hidden">
        <div className="grid gap-3">
          {[
            { icon: Bike, t: "Preguntas adaptadas", d: "Detectamos tu perfil y filtramos las preguntas relevantes." },
            { icon: ShieldCheck, t: "Confidencial", d: "Tus respuestas son anónimas y se usan solo con fines de análisis." },
            { icon: BarChart3, t: "Dashboard público", d: "Los resultados agregados se visualizan en un panel interactivo." },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="intt-shadow border-[var(--intt-gris-200)]">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--intt-electric-50)]">
                    <f.icon className="h-5 w-5 text-[var(--intt-electric)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--intt-navy-deep)]">{f.t}</h3>
                    <p className="text-sm text-[var(--intt-gris-700)]">{f.d}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
