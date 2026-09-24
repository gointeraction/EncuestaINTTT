"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";

interface Props {
  onToken: (token: string | null) => void;
  /** Clave del site (se inyecta desde el cliente). */
  siteKey?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

/**
 * Widget de Cloudflare Turnstile (anti-bot, sin fricción).
 * Carga el script de CF, renderiza el widget y notifica el token al padre.
 */
export function TurnstileWidget({ onToken, siteKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [expired, setExpired] = useState(false);
  const key = siteKey ?? TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return false;
    // Limpiar render anterior si existe
    containerRef.current.innerHTML = "";
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: key,
      theme: "light",
      language: "es",
      callback: (token: string) => {
        setExpired(false);
        onToken(token);
      },
      "expired-callback": () => {
        setExpired(true);
        onToken(null);
      },
      "error-callback": () => {
        onToken(null);
      },
    });
    return true;
  }, [key, onToken]);

  useEffect(() => {
    let cancelled = false;

    const doRender = () => {
      if (cancelled) return;
      if (renderWidget()) {
        setLoaded(true);
      }
    };

    if (window.turnstile) {
      doRender();
      return;
    }

    // Cargar el script de Turnstile una sola vez
    const existing = document.getElementById("cf-turnstile-script");
    if (existing) {
      existing.addEventListener("load", doRender);
      return;
    }

    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = doRender;
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
      }
    };
  }, [renderWidget]);

  const handleReset = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--intt-navy-deep)]">
        <ShieldCheck className="h-3.5 w-3.5 text-[var(--intt-electric)]" />
        Verificación de seguridad
      </div>
      <div ref={containerRef} className="min-h-[65px]" aria-live="polite" />
      {!loaded && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Cargando verificación...
        </p>
      )}
      {expired && (
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-[var(--intt-electric)] underline hover:no-underline"
        >
          La verificación expiró. Haz clic aquí para reintentar.
        </button>
      )}
      <p className="text-[10px] text-muted-foreground">
        Protegido por Cloudflare Turnstile contra envíos automatizados.
      </p>
    </div>
  );
}
