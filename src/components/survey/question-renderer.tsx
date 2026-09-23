"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin } from "lucide-react";
import type { Question } from "@/lib/survey-data";
import type { AnswerValue } from "@/store/survey-store";
import {
  VENEZUELA_ESTADOS,
  ESTADO_NOMBRES,
  getMunicipiosByEstado,
} from "@/lib/venezuela-estados";

interface Props {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  /** Respuestas completas (necesarias para preguntas compuestas como estado-municipio). */
  allAnswers?: Record<string, AnswerValue>;
  /** Setter para respuestas compuestas (varias claves a la vez). */
  onMultiChange?: (updates: Record<string, AnswerValue>) => void;
}

export function QuestionRenderer({ question, value, onChange, allAnswers, onMultiChange }: Props) {
  const q = question;

  const labelEl = (
    <div className="space-y-1">
      <Label className="text-base font-medium leading-snug">
        {q.text}
        {q.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {q.help && <p className="text-sm text-muted-foreground">{q.help}</p>}
    </div>
  );

  switch (q.type) {
    // -------------------------------------------------------------------------
    case "radio":
      return (
        <div className="space-y-3">
          {labelEl}
          <RadioGroup
            value={typeof value === "string" ? value : ""}
            onValueChange={(v) => onChange(v)}
            className="grid gap-2"
          >
            {q.options?.map((opt) => (
              <label
                key={opt}
                htmlFor={`${q.id}-${opt}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-input p-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem id={`${q.id}-${opt}`} value={opt} />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      );

    // -------------------------------------------------------------------------
    case "checkbox":
      return (
        <div className="space-y-3">
          {labelEl}
          <div className="grid gap-2">
            {(q.options ?? []).map((opt) => {
              const checked = Array.isArray(value) && value.includes(opt);
              return (
                <label
                  key={opt}
                  htmlFor={`${q.id}-${opt}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-input p-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <Checkbox
                    id={`${q.id}-${opt}`}
                    checked={checked}
                    onCheckedChange={(c) => {
                      const arr = Array.isArray(value) ? [...value] : [];
                      if (c) arr.push(opt);
                      else {
                        const i = arr.indexOf(opt);
                        if (i >= 0) arr.splice(i, 1);
                      }
                      onChange(arr);
                    }}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      );

    // -------------------------------------------------------------------------
    case "select":
      return (
        <div className="space-y-3">
          {labelEl}
          <Select
            value={typeof value === "string" ? value : ""}
            onValueChange={(v) => onChange(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {(q.options ?? []).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    // -------------------------------------------------------------------------
    case "text":
      return (
        <div className="space-y-3">
          {labelEl}
          <Input
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tu respuesta"
          />
        </div>
      );

    // -------------------------------------------------------------------------
    case "textarea":
      return (
        <div className="space-y-3">
          {labelEl}
          <Textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe aquí..."
            rows={3}
          />
        </div>
      );

    // -------------------------------------------------------------------------
    case "number":
      return (
        <div className="space-y-3">
          {labelEl}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              value={value !== undefined && value !== null ? String(value) : ""}
              onChange={(e) => {
                const n = e.target.value === "" ? "" : Number(e.target.value);
                onChange(n === "" ? "" : (n as number));
              }}
              min={q.scaleMin}
              max={q.scaleMax}
              className="max-w-[140px]"
            />
            {q.unit && <span className="text-sm text-muted-foreground">{q.unit}</span>}
          </div>
        </div>
      );

    // -------------------------------------------------------------------------
    case "scale": {
      const numVal =
        typeof value === "number"
          ? value
          : value
          ? Number(value)
          : q.scaleMin ?? 1;
      const min = q.scaleMin ?? 1;
      const max = q.scaleMax ?? 5;
      return (
        <div className="space-y-4">
          {labelEl}
          <div className="rounded-lg border border-input p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {numVal}
              </span>
              <Slider
                value={[numVal]}
                min={min}
                max={max}
                step={1}
                onValueChange={(arr) => onChange(arr[0])}
                className="flex-1"
              />
            </div>
            {q.scaleLabels && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{q.scaleLabels.min}</span>
                <span>{q.scaleLabels.max}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              {Array.from({ length: max - min + 1 }, (_, i) => (
                <span key={i}>{min + i}</span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------------------
    case "estado-municipio": {
      const estadoVal =
        (allAnswers?.["estado"] as string | undefined) ?? "";
      const municipioVal =
        (allAnswers?.["municipio"] as string | undefined) ?? "";
      const municipios = estadoVal ? getMunicipiosByEstado(estadoVal) : [];
      const capital = estadoVal
        ? VENEZUELA_ESTADOS.find((e) => e.nombre === estadoVal)?.capital
        : undefined;

      return (
        <div className="space-y-3">
          {labelEl}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Estado */}
            <div className="space-y-1.5">
              <Label htmlFor={`${q.id}-estado`} className="text-sm font-medium">
                Estado <span className="text-destructive">*</span>
              </Label>
              <Select
                value={estadoVal}
                onValueChange={(v) => {
                  // Al cambiar el estado, se resetea el municipio
                  onMultiChange?.({ estado: v, municipio: "" });
                }}
              >
                <SelectTrigger id={`${q.id}-estado`} className="w-full">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Selecciona el estado" />
                  </span>
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {ESTADO_NOMBRES.map((est) => (
                    <SelectItem key={est} value={est}>
                      {est}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Municipio */}
            <div className="space-y-1.5">
              <Label htmlFor={`${q.id}-municipio`} className="text-sm font-medium">
                Municipio <span className="text-destructive">*</span>
              </Label>
              <Select
                value={municipioVal}
                onValueChange={(v) => onMultiChange?.({ municipio: v })}
                disabled={!estadoVal}
              >
                <SelectTrigger id={`${q.id}-municipio`} className="w-full">
                  <SelectValue
                    placeholder={
                      estadoVal
                        ? municipios.length
                          ? "Selecciona el municipio"
                          : "Sin municipios"
                        : "Primero elige un estado"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {municipios.map((mun) => (
                    <SelectItem key={mun} value={mun}>
                      {mun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {estadoVal && capital && (
            <p className="text-xs text-muted-foreground">
              Capital del estado: <strong className="text-foreground">{capital}</strong>
              {" · "}
              {municipios.length} municipio(s) disponible(s)
            </p>
          )}
        </div>
      );
    }

    // -------------------------------------------------------------------------
    default:
      return null;
  }
}
