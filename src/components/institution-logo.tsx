"use client";

import { useState, useEffect } from "react";
import { INSTITUTION } from "@/lib/institution";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<LogoSize, { box: string; text: string; sub: string }> = {
  sm: { box: "h-7 w-7 text-[10px]", text: "text-sm", sub: "text-[10px]" },
  md: { box: "h-9 w-9 text-xs", text: "text-sm", sub: "text-[11px]" },
  lg: { box: "h-12 w-12 text-sm", text: "text-base", sub: "text-xs" },
  xl: { box: "h-20 w-20 text-lg", text: "text-xl", sub: "text-sm" },
};

interface Props {
  size?: LogoSize;
  /** Mostrar el nombre de la institución junto al logo */
  showName?: boolean;
  /** Variante compacta: solo monograma + acrónimo (ideal para header) */
  compact?: boolean;
  className?: string;
}

/**
 * Logo institucional con fallback automático.
 * - Si existe /public/intt-logo.png → muestra la imagen.
 * - Si no existe → muestra un monograma estilizado "INTT" con escudo.
 */
export function InstitutionLogo({
  size = "md",
  showName = true,
  compact = false,
  className,
}: Props) {
  const [errored, setErrored] = useState(false);
  const [checked, setChecked] = useState(false);

  // Verificar si el archivo del logo existe realmente. Usamos un HEAD fetch
  // para no depender de onError (que en algunos navegadores no dispara bien
  // con imágenes 404 servidas por Next).
  useEffect(() => {
    let active = true;
    fetch(INSTITUTION.logoSrc, { method: "HEAD" })
      .then((r) => {
        if (active) {
          setErrored(!r.ok);
          setChecked(true);
        }
      })
      .catch(() => {
        if (active) {
          setErrored(true);
          setChecked(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative shrink-0", s.box)}>
        {checked && !errored ? (
          <img
            src={INSTITUTION.logoSrc}
            alt={`Logo ${INSTITUTION.shortName}`}
            className="h-full w-full object-contain"
            onError={() => setErrored(true)}
          />
        ) : (
          // Fallback: monograma con escudo de seguridad vial
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 font-bold tracking-tight text-primary-foreground shadow-sm">
            {INSTITUTION.acronym}
          </div>
        )}
      </div>

      {showName && (
        <div className="min-w-0 leading-tight">
          <p className={cn("font-semibold text-foreground", s.text)}>
            {compact ? INSTITUTION.shortName : INSTITUTION.appTitle}
          </p>
          {!compact && (
            <p className={cn("text-muted-foreground", s.sub)}>
              {INSTITUTION.appSubtitle}
            </p>
          )}
          {compact && (
            <p className={cn("text-muted-foreground", s.sub)}>
              {INSTITUTION.shortName}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Bloque de logo "grande" para la pantalla de bienvenida y el footer.
 * Muestra el logo + nombre completo de la institución.
 */
export function InstitutionBrand({
  size = "lg",
  withFullName = true,
  className,
}: {
  size?: LogoSize;
  withFullName?: boolean;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(INSTITUTION.logoSrc, { method: "HEAD" })
      .then((r) => {
        if (active) {
          setErrored(!r.ok);
          setChecked(true);
        }
      })
      .catch(() => {
        if (active) {
          setErrored(true);
          setChecked(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative shrink-0", s.box)}>
        {checked && !errored ? (
          <img
            src={INSTITUTION.logoSrc}
            alt={`Logo ${INSTITUTION.name}`}
            className="h-full w-full object-contain"
            onError={() => setErrored(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 font-bold tracking-tight text-primary-foreground shadow-sm">
            {INSTITUTION.acronym}
          </div>
        )}
      </div>
      {withFullName && (
        <div className="min-w-0 leading-tight">
          <p className={cn("font-bold text-foreground", s.text)}>
            {INSTITUTION.appTitle}
          </p>
          <p className={cn("text-muted-foreground", s.sub)}>
            {INSTITUTION.name}
          </p>
        </div>
      )}
    </div>
  );
}
