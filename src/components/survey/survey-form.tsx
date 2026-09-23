"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import { useSurveyStore } from "@/store/survey-store";
import {
  getSectionsForDriverType,
  getActiveQuestions,
  DRIVER_TYPES,
} from "@/lib/survey-data";
import { QuestionRenderer } from "./question-renderer";

export function SurveyForm() {
  const { driverType, answers, setAnswer, setView, setSavedId, clearAnswers } =
    useSurveyStore();
  const { toast } = useToast();
  const [sectionIdx, setSectionIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

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
        const v = answers[q.id];
        if (v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)) {
          answered++;
        }
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
  const missingRequired = activeQuestions.filter((q) => {
    if (!q.required) return false;
    const v = answers[q.id];
    return (
      v === undefined ||
      v === null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0)
    );
  });

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
      handleSubmit();
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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverType, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setSavedId(data.id);
      toast({ title: "Encuesta enviada", description: "Gracias por participar." });
      clearAnswers();
      setView("thanks");
    } catch (e) {
      toast({
        title: "Error al enviar",
        description: e instanceof Error ? e.message : "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isLast = sectionIdx === sections.length - 1;
  const SectionIcon =
    (Icons as Record<string, Icons.LucideIcon>)[currentSection?.icon ?? ""] ?? Icons.List;

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
          <span className="rounded-full bg-muted px-2 py-0.5">{driver.label}</span>
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <SectionIcon className="h-5 w-5 text-primary" />
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
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* --- navegación --- */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={handlePrev} disabled={submitting}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          {sectionIdx === 0 ? "Cambiar perfil" : "Anterior"}
        </Button>
        <Button onClick={handleNext} disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLast ? (
            <>
              {submitting ? "Enviando..." : "Enviar encuesta"}
              {!submitting && <Send className="ml-2 h-4 w-4" />}
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
          const done =
            aq.length > 0 &&
            aq.every((q) => {
              const v = answers[q.id];
              return (
                v !== undefined &&
                v !== null &&
                v !== "" &&
                !(Array.isArray(v) && v.length === 0)
              );
            });
          return (
            <button
              key={s.id}
              onClick={() => setSectionIdx(i)}
              className={`h-2.5 w-8 rounded-full transition-colors ${
                i === sectionIdx
                  ? "bg-primary"
                  : done
                  ? "bg-primary/40"
                  : "bg-muted"
              }`}
              aria-label={`Ir a sección ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
