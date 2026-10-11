"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Gift } from "lucide-react";
import { useSurveyStore } from "@/store/survey-store";
import {
  getSectionsForDriverType,
  getActiveQuestions,
  DRIVER_TYPES,
} from "@/lib/survey-data";
import { QuestionRenderer } from "./question-renderer";
import type { Question } from "@/lib/survey-data";
import type { AnswerValue } from "@/store/survey-store";

/** Determina si una pregunta está respondida (maneja la pregunta compuesta estado-municipio). */
function isAnswered(q: Question, answers: Record<string, AnswerValue>): boolean {
  if (q.type === "estado-municipio") {
    const e = answers["estado"];
    const m = answers["municipio"];
    return !!e && !!m && e !== "" && m !== "";
  }
  const v = answers[q.id];
  return (
    v !== undefined &&
    v !== null &&
    v !== "" &&
    !(Array.isArray(v) && v.length === 0)
  );
}

export function SurveyForm() {
  const { driverType, answers, setAnswer, setMultiAnswer, setView } =
    useSurveyStore();
  const { toast } = useToast();
  const [sectionIdx, setSectionIdx] = useState(0);

  const driver = DRIVER_TYPES.find((d) => d.id === driverType);
  const sections = useMemo(
    () => (driverType ? getSectionsForDriverType(driverType) : []),
    [driverType]
  );

  // --- progreso global (cuenta preguntas activas en todas las secciones) ---
  const { totalActive, answeredActive } = useMemo(() => {
    if (!driverType) return { totalActive: 0, answeredActive: 0 };
    let total = 0;
    let answered = 0;
    for (const s of sections) {
      const aq = getActiveQuestions(s, driverType, answers);
      total += aq.length;
      for (const q of aq) {
        if (isAnswered(q, answers)) answered++;
      }
    }
    return { totalActive: total, answeredActive: answered };
  }, [sections, driverType, answers]);

  if (!driverType || !driver) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No se ha seleccionado un tipo de conductor.
        <div className="mt-4">
          <Button onClick={() => setView("driver")}>Seleccionar perfil</Button>
        </div>
      </div>
    );
  }

  const currentSection = sections[sectionIdx];
  const activeQuestions = currentSection
    ? getActiveQuestions(currentSection, driverType, answers)
    : [];

  const progress = totalActive ? Math.round((answeredActive / totalActive) * 100) : 0;

  // --- validación de la sección actual (requeridos) ---
  const missingRequired = activeQuestions.filter((q) => q.required && !isAnswered(q, answers));

  const handleNext = () => {
    if (missingRequired.length > 0) {
      toast({
        title: "Preguntas obligatorias",
        description: `Faltan ${missingRequired.length} respuesta(s) obligatoria(s) en esta sección.`,
        variant: "destructive",
      });
      return;
    }
    if (sectionIdx < sections.length - 1) {
      setSectionIdx(sectionIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Última sección → ir al paso del sorteo (captura opcional de datos)
      setView("sorteo");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (sectionIdx > 0) {
      setSectionIdx(sectionIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setView("driver");
    }
  };

  const isLast = sectionIdx === sections.length - 1;
  const SectionIcon =
    ((Icons as unknown) as Record<string, Icons.LucideIcon>)[currentSection?.icon ?? ""] ?? Icons.List;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* --- cabecera con progreso --- */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className="font-medium">
            Sección {sectionIdx + 1} de {sections.length}
          </span>
          <span className="text-muted-foreground">{progress}% completado</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-[var(--intt-electric-50)] px-2 py-0.5 font-medium text-[var(--intt-electric-deep)]">{driver.label}</span>
          <span>·</span>
          <span>{answeredActive}/{totalActive} preguntas respondidas</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--intt-electric-50)]">
                  <SectionIcon className="h-5 w-5 text-[var(--intt-electric)]" />
                </div>
                <div>
                  <CardTitle className="text-xl">{currentSection?.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {currentSection?.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeQuestions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay preguntas en esta sección según tus respuestas anteriores.
                </p>
              )}
              {activeQuestions.map((q) => (
                <QuestionRenderer
                  key={q.id}
                  question={q}
                  value={answers[q.id]}
                  onChange={(v) => setAnswer(q.id, v)}
                  allAnswers={answers}
                  onMultiChange={(updates) => setMultiAnswer(updates)}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* --- navegación --- */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrev}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          {sectionIdx === 0 ? "Cambiar perfil" : "Anterior"}
        </Button>
        <Button onClick={handleNext}>
          {isLast ? (
            <>
              Continuar al sorteo
              <Gift className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* --- mini-navegación de secciones --- */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {sections.map((s, i) => {
          const aq = getActiveQuestions(s, driverType, answers);
          const done = aq.length > 0 && aq.every((q) => isAnswered(q, answers));
          return (
            <button
              key={s.id}
              onClick={() => setSectionIdx(i)}
              className={`h-2.5 w-8 rounded-full transition-colors ${
                i === sectionIdx
                  ? "bg-[var(--intt-electric)]"
                  : done
                  ? "bg-[var(--intt-electric)]/40"
                  : "bg-[var(--intt-gris-300)]"
              }`}
              aria-label={`Ir a sección ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
