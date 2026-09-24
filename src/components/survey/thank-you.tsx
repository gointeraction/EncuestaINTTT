"use client";

import { motion } from "framer-motion";
import { CheckCircle2, BarChart3, RotateCcw, Gift, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSurveyStore } from "@/store/survey-store";

export function ThankYou() {
  const { setView, savedId, driverType, codigoSorteo, participaSorteo } = useSurveyStore();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--intt-electric-50)]"
            >
              <CheckCircle2 className="h-12 w-12 text-[var(--intt-electric)]" />
            </motion.div>

            <h2 className="text-2xl font-bold text-[var(--intt-navy-deep)]">¡Gracias por tu participación!</h2>
            <p className="text-muted-foreground">
              Tu respuesta se registró correctamente. Cada voz suma para avanzar
              hacia una <strong>Visión Cero</strong> en siniestros de motocicletas.
            </p>

            {/* --- confirmación del sorteo --- */}
            {participaSorteo && codigoSorteo ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full rounded-xl border border-[var(--intt-gold)]/50 bg-[var(--intt-gold-50)] p-4"
              >
                <div className="flex items-center justify-center gap-2 text-[#6b5403]">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm font-semibold">¡Estás participando en el sorteo!</span>
                </div>
                <div className="mt-3 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#8c6f04]">
                    <Ticket className="h-3.5 w-3.5" />
                    Tu código de confirmación
                  </div>
                  <p className="font-mono text-2xl font-bold tracking-[0.2em] text-[var(--intt-navy-deep)]">
                    {codigoSorteo}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8c6f04]">
                    Guárdalo: te lo solicitaremos para reclamar tu premio si resultas ganador.
                  </p>
                </div>
              </motion.div>
            ) : (
              <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                Respondiste de forma anónima. Si querías participar en el sorteo,
                podrás hacerlo en tu próxima encuesta.
              </p>
            )}

            {savedId && (
              <p className="rounded-md bg-muted px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
                ID interno: {savedId}
              </p>
            )}

            {driverType && (
              <p className="text-xs text-muted-foreground">
                Perfil registrado:{" "}
                <span className="font-medium text-foreground">
                  {driverType.replace(/_/g, " ")}
                </span>
              </p>
            )}

            <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                onClick={() => setView("dashboard")}
                className="bg-[var(--intt-electric)] text-white hover:bg-[var(--intt-electric-deep)]"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver dashboard de resultados
              </Button>
              <Button variant="outline" onClick={() => setView("welcome")}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Realizar otra encuesta
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
