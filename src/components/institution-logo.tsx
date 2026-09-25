"use client";

import { useState } from "react";
import { INSTITUTION } from "@/lib/institution";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

const heightMap: Record<LogoSize, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-12",
  xl: "h-16",
};

interface Props {
  size?: LogoSize;
  /** Variante para fondo oscuro (navy) — texto blanco (default) */
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Logo institucional del INTT.
 * Usa el logo real descargado del sitio oficial (texto blanco sobre navy).
 * Si la imagen falla, muestra un monograma "INTT" como fallback.
 */
export function InstitutionLogo({
  size = "md",
  variant = "light",
  className,
}: Props) {
  const [errored, setErrored] = useState(false);
  const h = heightMap[size];

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative shrink-0", h)}>
        {errored ? (
          <div
            className={cn(
              "flex h-full w-auto items-center rounded-md px-2 font-bold tracking-tight",
              variant === "light"
                ? "bg-[var(--intt-gold)] text-[var(--intt-navy-deep)]"
                : "bg-[var(--intt-navy-deep)] text-white"
            )}
            style={{ aspectRatio: "300 / 112" }}
          >
            INTT
          </div>
        ) : (
          <img
            src={INSTITUTION.logoSrc}
            alt={`${INSTITUTION.shortName} — ${INSTITUTION.name}`}
            className="h-full w-auto object-contain"
            onError={() => setErrored(true)}
          />
        )}
      </div>
    </div>
  );
}
