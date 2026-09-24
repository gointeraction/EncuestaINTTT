"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2, ArrowLeft, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSurveyStore } from "@/store/survey-store";
import { INSTITUTION } from "@/lib/institution";

export function AdminLogin() {
  const { setAdminAuthed, setAdminChecking } = useSurveyStore();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Acceso denegado",
          description: data.error ?? "Contraseña incorrecta",
          variant: "destructive",
        });
        return;
      }
      setAdminAuthed(true);
      setAdminChecking(false);
      toast({ title: "Acceso concedido", description: "Bienvenido al panel privado." });
    } catch {
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <Card className="intt-shadow-lg border-[var(--intt-gris-200)]">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--intt-navy-deep)]">
              <Lock className="h-8 w-8 text-[var(--intt-gold)]" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-[var(--intt-navy-deep)]">
                Panel privado
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Acceso restringido al dashboard de resultados del {INSTITUTION.shortName}.
                Ingresa la contraseña de administrador para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="text-sm font-medium">
                  Contraseña de administrador
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoFocus
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[var(--intt-electric)] text-white hover:bg-[var(--intt-electric-deep)]"
                disabled={submitting || !password}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Ingresar
                  </>
                )}
              </Button>
            </form>

            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-muted-foreground"
              onClick={() => {
                window.location.href = window.location.pathname;
              }}
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Volver a la encuesta
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/** Cabecera del panel de administración con botón de cerrar sesión. */
export function AdminHeader() {
  const { setAdminAuthed, setAdminChecking } = useSurveyStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setAdminAuthed(false);
      setAdminChecking(false);
      toast({ title: "Sesión cerrada" });
      window.location.href = window.location.pathname;
    } catch {
      toast({ title: "Error al cerrar sesión", variant: "destructive" });
    }
  };

  return (
    <div className="intt-navy-bg flex items-center justify-between px-4 py-2 text-xs text-white">
      <span className="flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5 text-[var(--intt-gold)]" />
        Panel privado · Modo administrador
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-white hover:bg-white/10 hover:text-white"
        onClick={handleLogout}
      >
        <LogOut className="mr-1 h-3.5 w-3.5" /> Cerrar sesión
      </Button>
    </div>
  );
}
