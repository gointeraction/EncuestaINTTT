"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, ShieldCheck, Trash2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InstitutionLogo } from "@/components/institution-logo";
import {
  getDevice,
  setDevice,
  clearDevice,
  parseEnrollmentCode,
  type DeviceConfig,
} from "@/lib/offline/device-config";

const CHANNEL_LABEL: Record<DeviceConfig["channel"], string> = {
  kiosk: "Kiosco",
  surveyor: "Encuestador",
};

/**
 * /canal — Asignar el CANAL de captura (kiosco/encuestador) a este dispositivo.
 * El operador pega el código de enrolamiento generado en Analytics → Dispositivos
 * (`/?device=<id>&key=<secret>&channel=<kiosk|surveyor>`). Sin código, el canal es
 * `public` (por defecto).
 */
export default function AssignChannelPage() {
  const { toast } = useToast();
  const [device, setDeviceState] = useState<DeviceConfig | null>(null);
  const [code, setCode] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDeviceState(getDevice());
    setReady(true);
  }, []);

  const handleAssign = () => {
    const config = parseEnrollmentCode(code);
    if (!config) {
      toast({
        title: "Código inválido",
        description:
          "Pega el código completo generado en Analytics → Dispositivos (incluye device, key y channel).",
        variant: "destructive",
      });
      return;
    }
    setDevice(config);
    setDeviceState(config);
    setCode("");
    toast({
      title: "Canal asignado",
      description: `Este dispositivo transmitirá como ${CHANNEL_LABEL[config.channel]} (${config.id}).`,
    });
  };

  const handleClear = () => {
    clearDevice();
    setDeviceState(null);
    toast({ title: "Asignación eliminada", description: "El canal vuelve a ser público." });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="intt-navy-gradient sticky top-0 z-30 border-b border-white/10 shadow-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md transition-opacity hover:opacity-90"
            aria-label="Volver al inicio"
          >
            <InstitutionLogo size="sm" variant="light" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la encuesta
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[var(--intt-electric)]" />
              Asignar canal
            </CardTitle>
            <CardDescription>
              Enrola este dispositivo como <b>Kiosco</b> o <b>Encuestador</b> para que cada
              cuestionario se transmita con su canal. Sin asignación, el canal es <b>público</b>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {/* Estado actual */}
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Radio
                className={
                  device
                    ? "h-5 w-5 text-[var(--intt-electric)]"
                    : "h-5 w-5 text-muted-foreground"
                }
              />
              <div className="flex-1 text-sm">
                <p className="font-medium">
                  Canal actual:{" "}
                  {ready && device ? CHANNEL_LABEL[device.channel] : "Público (por defecto)"}
                </p>
                {ready && device ? (
                  <p className="text-muted-foreground">
                    Dispositivo: <code className="break-all">{device.id}</code>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Este dispositivo aún no está enrolado en ningún canal.
                  </p>
                )}
              </div>
              {ready && device ? (
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Quitar
                </Button>
              ) : null}
            </div>

            {/* Código de enrolamiento */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="enrollment">Código de enrolamiento</Label>
              <Input
                id="enrollment"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAssign();
                }}
                placeholder="/?device=kiosco-ccs-01&key=...&channel=kiosk"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                Se genera en <b>Analytics → Dispositivos</b> (http://localhost:4301/admin/devices)
                al crear el dispositivo. Incluye <code>device</code>, <code>key</code> y{" "}
                <code>channel</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleAssign} disabled={!code.trim()}>
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                Asignar canal
              </Button>
              <Link href="/" className="text-sm text-muted-foreground hover:underline">
                Cancelar
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
