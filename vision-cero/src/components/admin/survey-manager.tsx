"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  QrCode,
  Globe,
  Copy,
  Check,
  Send,
  Trash2,
  ListPlus,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  Eye,
  Download,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SurveyItem {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  shortCode: string;
  status: "draft" | "published" | "closed" | "archived";
  accessMode: string;
  maxResponses: number | null;
  createdAt: string;
  _count?: {
    questions: number;
    responses: number;
  };
}

interface QuestionItem {
  id?: string;
  type: string;
  label: string;
  required: boolean;
  options?: { label: string; value: string }[];
}

interface SurveyManagerProps {
  onSelectSurveyForDashboard?: (surveyId: string) => void;
}

export function SurveyManager({ onSelectSurveyForDashboard }: SurveyManagerProps = {}) {
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "builder">("list");
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyItem | null>(null);
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [qrShortCode, setQrShortCode] = useState<string>("");
  const { toast } = useToast();

  // Formulario de nueva encuesta
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAccessMode, setNewAccessMode] = useState("public_anonymous");
  const [newMaxResponses, setNewMaxResponses] = useState("");
  const [newConsentText, setNewConsentText] = useState(
    "Autorizo al INTT el tratamiento de mis respuestas con fines estrictamente estadísticos y de formulación de políticas públicas de seguridad vial."
  );
  const [creating, setCreating] = useState(false);

  // Formulario de nueva pregunta para el Builder
  const [qType, setQType] = useState("single_choice");
  const [qLabel, setQLabel] = useState("");
  const [qRequired, setQRequired] = useState(true);
  const [qOptions, setQOptions] = useState<string[]>(["Opción 1", "Opción 2"]);
  const [addingQuestion, setAddingQuestion] = useState(false);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/surveys", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setSurveys(json.data);
      }
    } catch {
      toast({ title: "Error al cargar encuestas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast({ title: "El título es obligatorio", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/v1/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          access_mode: newAccessMode,
          max_responses: newMaxResponses ? parseInt(newMaxResponses, 10) : undefined,
          consent_text: newConsentText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error al crear", description: data.detail || data.error, variant: "destructive" });
        return;
      }

      toast({ title: "¡Encuesta creada con éxito!", description: "Ahora añade las preguntas." });
      setNewTitle("");
      setNewDescription("");
      setSelectedSurvey(data);
      setSurveyQuestions([]);
      setActiveTab("builder");
      await fetchSurveys();
    } catch {
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const openBuilderForSurvey = async (survey: SurveyItem) => {
    setSelectedSurvey(survey);
    setActiveTab("builder");
    try {
      const res = await fetch(`/api/v1/surveys/${survey.id}/questions`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.questions)) {
        setSurveyQuestions(data.questions);
      } else {
        setSurveyQuestions([]);
      }
    } catch {
      setSurveyQuestions([]);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;
    if (!qLabel.trim()) {
      toast({ title: "El enunciado es obligatorio", variant: "destructive" });
      return;
    }

    setAddingQuestion(true);
    try {
      const payload: Record<string, unknown> = {
        type: qType,
        label: qLabel,
        required: qRequired,
      };

      if (["single_choice", "multi_choice", "dropdown"].includes(qType)) {
        payload.options = qOptions.map((opt, i) => ({
          label: opt,
          value: `opt_${i + 1}_${opt.toLowerCase().replace(/\s+/g, "_")}`,
        }));
      } else if (qType === "scale" || qType === "rating") {
        payload.validation_rules = { min: 1, max: qType === "rating" ? 5 : 10 };
      }

      const res = await fetch(`/api/v1/surveys/${selectedSurvey.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error al añadir pregunta", description: data.detail, variant: "destructive" });
        return;
      }

      toast({ title: "Pregunta añadida" });
      setSurveyQuestions((prev) => [...prev, data]);
      setQLabel("");
      setQOptions(["Opción 1", "Opción 2"]);
      await fetchSurveys();
    } catch {
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      setAddingQuestion(false);
    }
  };

  const handlePublishSurvey = async (surveyId: string) => {
    try {
      const res = await fetch(`/api/v1/surveys/${surveyId}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "No se pudo publicar", description: data.detail, variant: "destructive" });
        return;
      }

      toast({ title: "¡Encuesta Publicada!", description: `Disponible en /s/${data.shortCode}` });
      await fetchSurveys();
      if (selectedSurvey && selectedSurvey.id === surveyId) {
        setSelectedSurvey((prev) => prev ? { ...prev, status: "published" } : null);
      }
    } catch {
      toast({ title: "Error al publicar", variant: "destructive" });
    }
  };

  const showQrCode = async (survey: SurveyItem) => {
    try {
      setQrShortCode(survey.shortCode);
      const res = await fetch(`/api/v1/surveys/${survey.id}/qr?format=svg`);
      const svgText = await res.text();
      setQrSvg(svgText);
      setQrModalOpen(true);
    } catch {
      toast({ title: "Error al generar QR", variant: "destructive" });
    }
  };

  const copyPublicUrl = (shortCode: string, id: string) => {
    const url = `${window.location.origin}/s/${shortCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: "Enlace copiado al portapapeles", description: url });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Navegación de pestañas */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--intt-navy)]">
            Módulo de Gestión y Creación de Encuestas
          </h1>
          <p className="text-sm text-muted-foreground">
            Diseña, publica y distribuye formularios dinámicos con validación criptográfica y códigos QR.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("list")}
            className={activeTab === "list" ? "bg-[var(--intt-electric)]" : ""}
          >
            <Layers className="mr-1.5 h-4 w-4" />
            Todas las Encuestas ({surveys.length})
          </Button>

          <Button
            variant={activeTab === "create" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("create")}
            className={activeTab === "create" ? "bg-[var(--intt-electric)]" : ""}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva Encuesta
          </Button>
        </div>
      </div>

      {/* -------------------- TAB: LISTADO DE ENCUESTAS -------------------- */}
      {activeTab === "list" && (
        <div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando encuestas...</div>
          ) : surveys.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Layers className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-semibold">No hay encuestas creadas aún</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Crea tu primera encuesta institucional para comenzar a recolectar respuestas ciudadanas.
                </p>
                <Button onClick={() => setActiveTab("create")} className="bg-[var(--intt-electric)] text-white">
                  <Plus className="mr-2 h-4 w-4" /> Crear Primera Encuesta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {surveys.map((survey) => {
                const isPublished = survey.status === "published";
                const isDraft = survey.status === "draft";
                const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${survey.shortCode}`;

                return (
                  <Card key={survey.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant={isPublished ? "default" : isDraft ? "secondary" : "outline"}
                          className={
                            isPublished
                              ? "bg-emerald-600 text-white"
                              : isDraft
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-800"
                          }
                        >
                          {survey.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          /s/{survey.shortCode}
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-snug line-clamp-2">
                        {survey.title}
                      </CardTitle>
                      {survey.description && (
                        <CardDescription className="line-clamp-2 text-xs">
                          {survey.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                        <div>
                          <span className="font-semibold block text-slate-900">
                            {survey._count?.questions ?? 0}
                          </span>
                          Preguntas
                        </div>
                        <div>
                          <span className="font-semibold block text-slate-900">
                            {survey._count?.responses ?? 0}
                          </span>
                          Respuestas
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {isDraft ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openBuilderForSurvey(survey)}
                            >
                              <ListPlus className="mr-1.5 h-3.5 w-3.5" />
                              Editar Preguntas
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handlePublishSurvey(survey.id)}
                            >
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                              Publicar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => copyPublicUrl(survey.shortCode, survey.id)}
                            >
                              {copiedId === survey.id ? (
                                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Copiar Link
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => showQrCode(survey)}
                              title="Ver Código QR"
                            >
                              <QrCode className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openBuilderForSurvey(survey)}
                              title="Ver Preguntas"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* Botón para ver el dashboard específico de esta encuesta */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs text-[var(--intt-navy)] border-[var(--intt-navy)]/30 hover:bg-[var(--intt-navy)] hover:text-white transition-colors"
                          onClick={() => {
                            if (onSelectSurveyForDashboard) {
                              onSelectSurveyForDashboard(survey.id);
                            }
                          }}
                        >
                          <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                          Ver Dashboard de Esta Encuesta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -------------------- TAB: CREAR NUEVA ENCUESTA -------------------- */}
      {activeTab === "create" && (
        <Card className="max-w-2xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--intt-gold)]" />
              Diseñar Nueva Encuesta
            </CardTitle>
            <CardDescription>
              Configura los parámetros iniciales de la encuesta antes de agregar las preguntas.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateSurvey} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-semibold">
                  Título de la Encuesta *
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Encuesta de Calidad de Señalización Vial 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Descripción u Objetivos</Label>
                <Textarea
                  id="description"
                  placeholder="Explica a los ciudadanos el propósito y alcance de esta encuesta..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="accessMode">Modo de Acceso</Label>
                  <select
                    id="accessMode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={newAccessMode}
                    onChange={(e) => setNewAccessMode(e.target.value)}
                  >
                    <option value="public_anonymous">Público y Anónimo (Enlace Abierto)</option>
                    <option value="email_verified">Email Verificado (Código OTP)</option>
                    <option value="invitation_token">Token de Invitación (Uso Único)</option>
                    <option value="whitelist">Lista Blanca de Correos</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxResponses">Límite Máximo de Respuestas</Label>
                  <Input
                    id="maxResponses"
                    type="number"
                    placeholder="Ej: 1000 (vacío para ilimitado)"
                    value={newMaxResponses}
                    onChange={(e) => setNewMaxResponses(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="consent">Texto de Consentimiento Informado (GDPR)</Label>
                <Textarea
                  id="consent"
                  value={newConsentText}
                  onChange={(e) => setNewConsentText(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("list")}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-[var(--intt-electric)] text-white hover:bg-[var(--intt-electric-deep)]"
                >
                  {creating ? "Creando..." : "Crear y Continuar al Editor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* -------------------- TAB: BUILDER / EDITOR DE PREGUNTAS -------------------- */}
      {activeTab === "builder" && selectedSurvey && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg border">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedSurvey.status.toUpperCase()}</Badge>
                <h2 className="text-xl font-bold">{selectedSurvey.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Slug: /s/{selectedSurvey.shortCode} · Modo: {selectedSurvey.accessMode}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab("list")}>
                Volver a la Lista
              </Button>
              {selectedSurvey.status === "draft" && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handlePublishSurvey(selectedSurvey.id)}
                  disabled={surveyQuestions.length === 0}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Publicar Encuesta
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario para añadir pregunta */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-[var(--intt-electric)]" />
                  Añadir Pregunta
                </CardTitle>
                <CardDescription className="text-xs">
                  Agrega preguntas con tipado estricto y validaciones JSONB.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleAddQuestion} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Tipo de Pregunta</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                      value={qType}
                      onChange={(e) => setQType(e.target.value)}
                    >
                      <option value="single_choice">Selección Única (Radio)</option>
                      <option value="multi_choice">Casillas de Verificación (Múltiple)</option>
                      <option value="dropdown">Menú Desplegable</option>
                      <option value="scale">Escala Numérica (1 a 10)</option>
                      <option value="rating">Calificación por Estrellas (1 a 5)</option>
                      <option value="short_text">Texto Corto</option>
                      <option value="long_text">Texto Largo / Párrafo</option>
                      <option value="date">Fecha</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Enunciado *</Label>
                    <Input
                      placeholder="Ej: ¿Qué tan satisfecho está con...?"
                      value={qLabel}
                      onChange={(e) => setQLabel(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="qReq"
                      checked={qRequired}
                      onChange={(e) => setQRequired(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="qReq" className="text-xs cursor-pointer">
                      Campo obligatorio
                    </Label>
                  </div>

                  {/* Opciones para preguntas de selección */}
                  {["single_choice", "multi_choice", "dropdown"].includes(qType) && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-xs font-semibold">Opciones de Respuesta</Label>
                      {qOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-1.5">
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const updated = [...qOptions];
                              updated[idx] = e.target.value;
                              setQOptions(updated);
                            }}
                            className="h-8 text-xs"
                          />
                          {qOptions.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-500"
                              onClick={() => setQOptions(qOptions.filter((_, i) => i !== idx))}
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-7"
                        onClick={() => setQOptions([...qOptions, `Opción ${qOptions.length + 1}`])}
                      >
                        + Añadir Opción
                      </Button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={addingQuestion}
                    className="w-full mt-3 bg-[var(--intt-navy)] text-white hover:bg-[var(--intt-navy-900)] text-xs h-9"
                  >
                    {addingQuestion ? "Guardando..." : "Guardar Pregunta"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de preguntas existentes */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-semibold text-sm flex items-center justify-between">
                <span>Estructura del Formulario ({surveyQuestions.length} preguntas)</span>
                {surveyQuestions.length === 0 && (
                  <span className="text-xs text-amber-600 flex items-center gap-1 font-normal">
                    <AlertCircle className="h-3.5 w-3.5" /> Requiere al menos 1 pregunta para publicar
                  </span>
                )}
              </h3>

              {surveyQuestions.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed rounded-lg bg-slate-50 text-muted-foreground text-xs">
                  No hay preguntas en esta encuesta. Utiliza el formulario lateral para agregar la primera.
                </div>
              ) : (
                surveyQuestions.map((q, idx) => (
                  <Card key={q.id || idx} className="shadow-none border">
                    <CardContent className="p-3.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-[var(--intt-electric)]">
                            #{idx + 1}
                          </span>
                          <Badge variant="secondary" className="text-[10px] py-0">
                            {q.type}
                          </Badge>
                          {q.required && (
                            <Badge variant="destructive" className="text-[10px] py-0">
                              Obligatoria
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-900">{q.label}</p>
                        {q.options && q.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {q.options.map((opt, i) => (
                              <span
                                key={i}
                                className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                              >
                                • {opt.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Código QR */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Código QR de Acceso</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Escanea con la cámara de tu teléfono para acceder a la encuesta.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4">
            <div
              className="p-4 bg-white rounded-xl shadow-inner border max-w-[260px]"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="mt-3 text-xs font-mono text-muted-foreground">
              /s/{qrShortCode}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
