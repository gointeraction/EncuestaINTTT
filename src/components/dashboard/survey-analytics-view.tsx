"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  CheckCircle2,
  FileQuestion,
  Download,
  ExternalLink,
  RefreshCw,
  QrCode,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Star,
  Hash,
} from "lucide-react";

interface QuestionAnalytics {
  question_id: string;
  type: string;
  label: string;
  total_answers: number;
  average?: number;
  distribution?: Array<{
    option?: string;
    scale?: number;
    count: number;
    pct?: number;
  }>;
  recent_texts?: string[];
}

interface SurveyAnalyticsResult {
  survey_id: string;
  totals: {
    responses: number;
    completed: number;
    abandoned: number;
    completion_rate: number;
    abandonment_rate: number;
  };
  questions: QuestionAnalytics[];
  timeline: Array<{
    date: string;
    responses: number;
  }>;
}

interface SurveyMeta {
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

interface Props {
  surveyId: string;
  onOpenBuilder?: (surveyId: string) => void;
  onOpenSurveysList?: () => void;
}

const BAR_COLORS = [
  "#0066cc", // INTT Electric
  "#1c2454", // INTT Navy
  "#d4a373", // INTT Gold
  "#059669", // Emerald
  "#d97706", // Amber
  "#dc2626", // Red
  "#7c3aed", // Violet
  "#0891b2", // Cyan
];

export function SurveyAnalyticsView({ surveyId, onOpenBuilder, onOpenSurveysList }: Props) {
  const [analytics, setAnalytics] = useState<SurveyAnalyticsResult | null>(null);
  const [meta, setMeta] = useState<SurveyMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Cargar metadatos de la encuesta
      const metaRes = await fetch(`/api/v1/surveys/${surveyId}`, { cache: "no-store" });
      if (metaRes.ok) {
        const metaJson = await metaRes.json();
        setMeta(metaJson);
      }

      // 2. Cargar métricas analíticas
      const analyticsRes = await fetch(`/api/v1/surveys/${surveyId}/analytics`, { cache: "no-store" });
      if (analyticsRes.ok) {
        const analyticsJson = await analyticsRes.json();
        setAnalytics(analyticsJson);
      } else {
        toast({
          title: "No se pudieron cargar las analíticas",
          description: "La encuesta no tiene respuestas aún o no está disponible.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor de analítica.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (surveyId) {
      fetchData();
    }
  }, [surveyId]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/v1/surveys/${surveyId}/exports`);
      if (!res.ok) {
        toast({ title: "Error al exportar CSV", variant: "destructive" });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analitica_encuesta_${meta?.shortCode || surveyId}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "CSV Descargado con éxito", description: "Formato RFC 4180 con UTF-8 BOM" });
    } catch {
      toast({ title: "Error de conexión al exportar", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const totals = analytics?.totals || {
    responses: meta?._count?.responses || 0,
    completed: meta?._count?.responses || 0,
    abandoned: 0,
    completion_rate: 1,
    abandonment_rate: 0,
  };

  const isPublished = meta?.status === "published";
  const publicUrl = meta?.shortCode ? `${typeof window !== "undefined" ? window.location.origin : ""}/s/${meta.shortCode}` : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Encabezado de la Encuesta */}
      <div className="rounded-xl border bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={isPublished ? "default" : "secondary"}
                className={isPublished ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-amber-100 text-amber-900 border-amber-300"}
              >
                {meta?.status === "published" ? "● Encuesta Publicada" : meta?.status === "draft" ? "Borrador" : meta?.status}
              </Badge>
              {meta?.shortCode && (
                <Badge variant="outline" className="font-mono text-xs">
                  Código: {meta.shortCode}
                </Badge>
              )}
              {meta?.accessMode && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  {meta.accessMode === "public_anonymous" ? "Público Anónimo" : meta.accessMode}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--intt-navy)] sm:text-3xl">
              {meta?.title || "Detalle de Encuesta"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
              {meta?.description || "Resultados analíticos y desglose estadístico por pregunta en tiempo real."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="text-xs"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleExportCsv}
              disabled={exporting}
              className="bg-[var(--intt-navy)] text-white hover:bg-[var(--intt-navy-900)] text-xs"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {exporting ? "Generando..." : "Exportar CSV"}
            </Button>

            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver Enlace Ciudadano
              </a>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Respuestas
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--intt-electric)]/10 text-[var(--intt-electric)]">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totals.responses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.completed} completadas ({totals.abandoned} abandonadas)
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tasa de Finalización
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {totals.responses > 0 ? `${(totals.completion_rate * 100).toFixed(1)}%` : "100%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.abandonment_rate > 0 ? `${(totals.abandonment_rate * 100).toFixed(1)}% abandono` : "Excelente adherencia"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Preguntas Activas
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <FileQuestion className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.questions.length ?? meta?._count?.questions ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Campos estructurados en la encuesta
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cupo Máximo
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {meta?.maxResponses ? meta.maxResponses.toLocaleString() : "Ilimitado"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {meta?.maxResponses ? `${totals.responses} / ${meta.maxResponses} alcanzados` : "Sin tope de participación"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Serie Temporal (Línea de tiempo) */}
      {analytics?.timeline && analytics.timeline.length > 0 && (
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--intt-electric)]" />
              Evolución de Respuestas en el Tiempo
            </CardTitle>
            <CardDescription>Cantidad de formularios completados agrupados por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.timeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c2454",
                      color: "#fff",
                      borderRadius: "8px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="responses" name="Respuestas" fill="#0066cc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desglose Analítico por Pregunta */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h2 className="text-lg font-bold text-[var(--intt-navy)]">
              Desglose Analítico por Pregunta
            </h2>
            <p className="text-xs text-muted-foreground">
              Distribución de opciones, frecuencias y promedios para cada ítem de la encuesta.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {analytics?.questions.length || 0} Preguntas
          </Badge>
        </div>

        {(!analytics?.questions || analytics.questions.length === 0) ? (
          <Card className="border-dashed p-8 text-center">
            <FileQuestion className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
            <h3 className="font-semibold text-slate-800">Esta encuesta aún no tiene preguntas configuradas</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Agrega preguntas desde el constructor para visualizar las analíticas aquí.
            </p>
            {onOpenBuilder && (
              <Button onClick={() => onOpenBuilder(surveyId)} size="sm" className="bg-[var(--intt-electric)] text-white">
                Abrir Constructor de Preguntas
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {analytics.questions.map((q, idx) => {
              const hasDistribution = q.distribution && q.distribution.length > 0;
              const hasAverage = q.average !== undefined && q.average !== null;
              const hasTextAnswers = q.recent_texts && q.recent_texts.length > 0;

              return (
                <Card key={q.question_id || idx} className="flex flex-col justify-between border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        <Hash className="h-3 w-3" /> Pregunta {idx + 1}
                      </span>
                      <Badge variant="outline" className="text-[11px] capitalize text-muted-foreground">
                        {q.type.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold leading-snug text-slate-900">
                      {q.label}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {q.total_answers} respuestas registradas
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Gráfico para preguntas con escala / promedio */}
                    {hasAverage && (
                      <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-50/70 p-3 border border-amber-200/50">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-medium text-amber-900">Calificación promedio:</span>
                        </div>
                        <div className="text-xl font-bold text-amber-900">{q.average} / 5.0</div>
                      </div>
                    )}

                    {/* Distribución de Opciones (Barras) */}
                    {hasDistribution ? (
                      <div className="space-y-2.5 pt-1">
                        {q.distribution!.map((item, optIdx) => {
                          const label = item.option || `Escala ${item.scale}`;
                          const pct = item.pct ?? (totals.responses > 0 ? Number(((item.count / totals.responses) * 100).toFixed(1)) : 0);
                          const color = BAR_COLORS[optIdx % BAR_COLORS.length];

                          return (
                            <div key={optIdx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-700 truncate max-w-[70%]" title={label}>
                                  {label}
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {item.count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(pct, 100)}%`,
                                    backgroundColor: color,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : hasTextAnswers ? (
                      /* Muestra de respuestas textuales */
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> Respuestas ciudadanas recientes:
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {q.recent_texts!.map((txt, tIdx) => (
                            <div
                              key={tIdx}
                              className="rounded-md bg-slate-50 p-2 text-xs text-slate-700 border border-slate-100 italic"
                            >
                              "{txt}"
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        Sin respuestas aún para esta pregunta.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
