"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Gift, ArrowLeft, ArrowRight, Loader2, ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSurveyStore } from "@/store/survey-store";
import { validatePersonalData, VE_MOBILE_PREFIXES } from "@/lib/sorteo";

export function SorteoForm() {
  const { sorteo, setSorteo, answers, driverType, setView, setSavedId, setSorteoResult, clearAnswers } =
    useSurveyStore();
  const { toast } = useToast();
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Validación en vivo (solo si participa)
  const validation = useMemo(() => {
    if (!sorteo.participa) return { ok: true, errors: {}, normalized: null as null | { nombre: string; cedula: string; telefono: string } };
    const v = validatePersonalData({
      nombre: sorteo.nombre,
      cedula: sorteo.cedula,
      telefono: sorteo.telefono,
    });
    return { ok: v.ok, errors: v.errors, normalized: v.normalized };
  }, [sorteo]);

  const handleSubmit = async () => {
    setTouched(true);
    setServerError(null);

    if (sorteo.participa && !validation.ok) {
      toast({
        title: "Revisa los datos del sorteo",
        description: "Completa correctamente los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        driverType,
        answers,
        sorteo: sorteo.participa
          ? {
              participa: true,
              nombre: validation.normalized!.nombre,
              cedula: validation.normalized!.cedula,
              telefono: validation.normalized!.telefono,
            }
          : { participa: false },
      };
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setServerError(data.error ?? "Esta cédula ya participó.");
        } else if (data.fieldErrors) {
          // errores de validación del servidor
          toast({
            title: "Datos inválidos",
            description: Object.values(data.fieldErrors as Record<string, string>).join(" "),
            variant: "destructive",
          });
        } else {
          throw new Error(data.error ?? "Error");
        }
        return;
      }
      // Limpiar primero el estado de la encuesta, luego establecer el resultado
      // (clearAnswers resetea savedId/codigoSorteo, así que los seteamos después)
      clearAnswers();
      setSavedId(data.id);
      setSorteoResult(data.codigoSorteo ?? null, data.participaSorteo ?? false);
      toast({
        title: sorteo.participa ? "¡Encuesta enviada y registrado en el sorteo!" : "Encuesta enviada",
        description: "Gracias por participar.",
      });
      setView("thanks");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Error al enviar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => setView("survey")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Volver a la encuesta
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="intt-shadow border-[var(--intt-gris-200)]">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--intt-gold-50)]">
                <Gift className="h-5 w-5 text-[#8c6f04]" />
              </div>
              <div>
                <CardTitle className="text-xl text-[var(--intt-navy-deep)]">
                  ¿Quieres participar en el sorteo?
                </CardTitle>
                <CardDescription className="mt-1">
                  Completa tus datos y concursa. La participación es opcional —
                  puedes enviar solo la encuesta si prefieres mantener el anonimato.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* --- Términos breves --- */}
            <div className="flex gap-2 rounded-lg border border-[var(--intt-gris-200)] bg-[var(--intt-electric-50)] p-3 text-xs text-[var(--intt-electric-deep)]">
              <Info className="h-4 w-4 shrink-0" />
              <p>
                Al participar aceptas que el <strong>INTT</strong> use tu cédula y teléfono
                únicamente para verificar tu identidad y contactarte si resultas ganador.
                Una participación por persona. Los datos de la encuesta siguen siendo anónimos.
              </p>
            </div>

            {/* --- Switch participar --- */}
            <div className="flex items-center justify-between rounded-lg border border-[var(--intt-gris-300)] p-4">
              <div>
                <Label htmlFor="participa" className="text-base font-semibold text-[var(--intt-navy-deep)]">
                  Sí, deseo participar en el sorteo
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Se solicitarán tus datos personales.
                </p>
              </div>
              <Switch
                id="participa"
                checked={sorteo.participa}
                onCheckedChange={(c) => {
                  setSorteo({ participa: c });
                  setTouched(false);
                  setServerError(null);
                }}
              />
            </div>

            {/* --- Formulario de datos personales --- */}
            {sorteo.participa && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Nombre */}
                <div className="space-y-1.5">
                  <Label htmlFor="nombre" className="text-sm font-medium">
                    Nombre completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={sorteo.nombre}
                    onChange={(e) => setSorteo({ nombre: e.target.value })}
                    placeholder="Ej: María González"
                    aria-invalid={touched && !!validation.errors.nombre}
                  />
                  {touched && validation.errors.nombre && (
                    <p className="text-xs text-destructive">{validation.errors.nombre}</p>
                  )}
                </div>

                {/* Cédula */}
                <div className="space-y-1.5">
                  <Label htmlFor="cedula" className="text-sm font-medium">
                    Cédula de identidad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cedula"
                    value={sorteo.cedula}
                    onChange={(e) => setSorteo({ cedula: e.target.value })}
                    placeholder="V-12345678  o  E-12345678"
                    aria-invalid={touched && !!validation.errors.cedula}
                    autoCapitalize="characters"
                  />
                  {touched && validation.errors.cedula ? (
                    <p className="text-xs text-destructive">{validation.errors.cedula}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Formato: V- (venezolano) o E- (extranjero) seguido de 6 a 8 dígitos.
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="space-y-1.5">
                  <Label htmlFor="telefono" className="text-sm font-medium">
                    Número de teléfono móvil <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="telefono"
                    value={sorteo.telefono}
                    onChange={(e) => setSorteo({ telefono: e.target.value })}
                    placeholder="0412-1234567  o  +58 412-1234567"
                    inputMode="tel"
                    aria-invalid={touched && !!validation.errors.telefono}
                  />
                  {touched && validation.errors.telefono ? (
                    <p className="text-xs text-destructive">{validation.errors.telefono}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Móviles válidos: {VE_MOBILE_PREFIXES.join(", ")}.
                    </p>
                  )}
                </div>

                {/* Consentimiento */}
                <label
                  htmlFor="consent"
                  className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[var(--intt-gris-200)] p-3 transition-colors hover:bg-accent has-[:checked]:border-[var(--intt-electric)] has-[:checked]:bg-[var(--intt-electric-50)]"
                >
                  <Checkbox
                    id="consent"
                    checked={sorteo.participa}
                    disabled
                    className="mt-0.5"
                  />
                  <span className="text-xs text-muted-foreground">
                    Autorizo al INTT a contactarme al número indicado exclusivamente
                    para notificarme en caso de resultar ganador del sorteo.
                  </span>
                </label>
              </motion.div>
            )}

            {/* Estado: no participa */}
            {!sorteo.participa && (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--intt-gris-200)] bg-muted/30 p-3 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Tu respuesta se enviará de forma anónima, sin datos personales.
              </div>
            )}

            {/* Error de servidor (cédula duplicada) */}
            {serverError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <Info className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            {/* --- navegación --- */}
            <div className="flex items-center justify-between border-t border-[var(--intt-gris-200)] pt-4">
              <Button variant="ghost" onClick={() => setView("survey")} disabled={submitting}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Anterior
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className={
                  sorteo.participa
                    ? "bg-[var(--intt-gold)] text-[var(--intt-navy-deep)] hover:bg-[var(--intt-gold-deep)] hover:text-[var(--intt-navy-deep)]"
                    : "bg-[var(--intt-electric)] text-white hover:bg-[var(--intt-electric-deep)]"
                }
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {sorteo.participa ? (
                  <>
                    {submitting ? "Enviando..." : "Enviar y participar"}
                    {!submitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
                  </>
                ) : (
                  <>
                    {submitting ? "Enviando..." : "Enviar encuesta"}
                    {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
