"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Gift, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* pill institucional */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--intt-electric-50)] px-3 py-1 text-xs font-semibold text-[var(--intt-electric-deep)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              {INSTITUTION.name}
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[var(--intt-navy-deep)] sm:text-5xl">
              Hacia una{" "}
              <span className="relative whitespace-nowrap text-[var(--intt-electric)]">
                Visión Cero
                <span className="intt-gold-rule absolute -bottom-1 left-0 h-1 w-full rounded-full" />
              </span>
              <br />
              en Siniestros de Motocicletas
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base text-[var(--intt-gris-700)] sm:text-lg">
              Esta encuesta recoge tu experiencia, percepciones y propuestas
              para reducir los siniestros de motocicleta. Las preguntas se{" "}
              <strong className="text-[var(--intt-navy-deep)]">
                adaptan automáticamente a tu tipo de conductor
              </strong>
              , para que solo respondas lo que aplica a tu perfil.
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                className="bg-[var(--intt-electric)] text-white hover:bg-[var(--intt-electric-deep)]"
                onClick={() => setView("driver")}
              >
                Comenzar encuesta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="mt-5 text-xs text-[var(--intt-gris-500)]">
              Tiempo estimado: 8–12 minutos · Hasta{" "}
              {countQuestionsForDriverType("delivery")} preguntas según tu perfil
            </p>

            {/* banner sorteo */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mx-auto mt-6 flex max-w-lg items-center gap-3 rounded-xl border border-[var(--intt-gold)]/40 bg-[var(--intt-gold-50)] p-3 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--intt-gold)] text-[var(--intt-navy-deep)]">
                <Gift className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-[#6b5403]">
                  ¡Participa en el sorteo!
                </p>
                <p className="text-xs text-[#8c6f04]">
                  Al final de la encuesta puedes registrar tu cédula y teléfono
                  para concursar. Participación opcional.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
