"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { useSurveyStore } from "@/store/survey-store";
import {
  DRIVER_TYPES,
  countQuestionsForDriverType,
  type DriverTypeId,
} from "@/lib/survey-data";

export function DriverTypeSelector() {
  const { setView, setDriverType, driverType, clearAnswers } = useSurveyStore();

  const handleSelect = (id: DriverTypeId) => {
    clearAnswers();
    setDriverType(id);
  };

  const handleContinue = () => {
    if (driverType) setView("survey");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => setView("welcome")}
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Volver
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          ¿Cuál es tu perfil de conductor?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Selecciona la opción que mejor describa tu relación con la motocicleta.
          Según tu elección, la encuesta mostrará solo las preguntas que aplican a ti.
        </p>
      </motion.div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {DRIVER_TYPES.map((dt, i) => {
          const Icon = (Icons as Record<string, Icons.LucideIcon>)[dt.icon] ?? Icons.User;
          const selected = driverType === dt.id;
          const qCount = countQuestionsForDriverType(dt.id);
          return (
            <motion.div
              key={dt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card
                className={`intt-shadow cursor-pointer border-[var(--intt-gris-200)] transition-all hover:intt-shadow-lg ${
                  selected
                    ? "border-[var(--intt-electric)] ring-2 ring-[var(--intt-electric)]/30"
                    : ""
                }`}
                onClick={() => handleSelect(dt.id)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      selected
                        ? "bg-[var(--intt-electric)] text-white"
                        : "bg-[var(--intt-electric-50)] text-[var(--intt-electric)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold leading-tight">{dt.label}</h3>
                      {selected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{dt.description}</p>
                    <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {qCount} preguntas aplican
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" disabled={!driverType} onClick={handleContinue}>
          Continuar a la encuesta
        </Button>
      </div>
    </div>
  );
}
