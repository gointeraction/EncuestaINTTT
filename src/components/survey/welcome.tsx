"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Bike, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSurveyStore } from "@/store/survey-store";
import { countQuestionsForDriverType } from "@/lib/survey-data";

export function Welcome() {
  const setView = useSurveyStore((s) => s.setView);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Hacia una Visión Cero
          <span className="block text-primary">en Siniestros de Motocicletas</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Esta encuesta recoge información sobre tu experiencia, percepciones y propuestas
          para reducir los siniestros de motocicleta. Las preguntas se{" "}
          <strong className="text-foreground">adaptan automáticamente a tu tipo de conductor</strong>,
          para que solo respondas lo que aplica a tu perfil.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-10 grid gap-4 sm:grid-cols-3"
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
            <Bike className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Preguntas adaptadas</h3>
            <p className="text-sm text-muted-foreground">
              Detectamos tu perfil y mostramos solo las preguntas relevantes.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Confidencial</h3>
            <p className="text-sm text-muted-foreground">
              Tus respuestas son anónimas y se usan solo con fines de análisis.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">Dashboard público</h3>
            <p className="text-sm text-muted-foreground">
              Los resultados agregados se visualizan en un panel interactivo.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-10 flex flex-col items-center gap-3"
      >
        <Button size="lg" className="w-full max-w-xs text-base" onClick={() => setView("driver")}>
          Comenzar encuesta
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setView("dashboard")}>
          Ver dashboard de resultados
        </Button>
      </motion.div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Tiempo estimado: 8–12 minutos · Hasta{" "}
        {countQuestionsForDriverType("delivery")} preguntas según tu perfil
      </p>
    </div>
  );
}
