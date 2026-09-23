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
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Bike,
  ShieldCheck,
  Siren,
  Brain,
  TrendingUp,
  Database,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useSurveyStore } from "@/store/survey-store";

interface Stats {
  total: number;
  byDriverType: { id: string; label: string; count: number }[];
  bySex: { label: string; count: number }[];
  ageGroups: Record<string, number>;
  casco: { label: string; count: number }[];
  licencia: { label: string; count: number }[];
  siniestro: { label: string; count: number }[];
  siniestroGravedad: { label: string; count: number }[];
  causasPrincipales: { label: string; count: number }[];
  medidasEfectivas: { label: string; count: number }[];
  percepcionSeguridad: Record<string, number>;
  efectividadControl: Record<string, number>;
  usoCelular: { label: string; count: number }[];
  alcohol: { label: string; count: number }[];
  estadoVias: Record<string, number>;
  avg: {
    percepcionSeguridad: number;
    efectividadControl: number;
    estadoVias: number;
    senalizacion: number;
    velocidadOpinion: number;
    edad: number;
  };
  meta: { sections: number; driverTypes: number };
}

const COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.577 0.245 27.325)",
  "oklch(0.627 0.265 303.9)",
];

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();
  const setView = useSurveyStore((s) => s.setView);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/survey/stats", { cache: "no-store" });
      const data = await res.json();
      setStats(data);
    } catch {
      toast({ title: "Error al cargar datos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/survey/seed?count=80", { method: "POST" });
      const data = await res.json();
      toast({
        title: "Datos de demostración generados",
        description: `${data.seeded} respuestas sintéticas creadas.`,
      });
      await load();
    } catch {
      toast({ title: "Error al generar datos", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* --- header --- */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" onClick={() => setView("welcome")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver al inicio
          </Button>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard de Resultados
          </h1>
          <p className="mt-1 text-muted-foreground">
            Análisis agregado de las encuestas de Visión Cero en Siniestros de Motocicletas.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
          {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
          {seeding ? "Generando..." : "Cargar datos demo"}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !stats || stats.total === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Database className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">Aún no hay respuestas</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Completa la encuesta o carga datos de demostración para visualizar el dashboard.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setView("welcome")}>Responder encuesta</Button>
              <Button variant="outline" onClick={handleSeed} disabled={seeding}>
                Cargar datos demo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* --- KPIs --- */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<Users className="h-5 w-5" />}
              label="Total respuestas"
              value={stats.total}
              color="bg-primary/10 text-primary"
            />
            <KpiCard
              icon={<Bike className="h-5 w-5" />}
              label="Tipos de conductor"
              value={stats.byDriverType.filter((d) => d.count > 0).length}
              sub={`${stats.meta.driverTypes} perfiles`}
              color="bg-orange-500/10 text-orange-600 dark:text-orange-400"
            />
            <KpiCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Edad promedio"
              value={stats.avg.edad ? `${stats.avg.edad.toFixed(0)} años` : "—"}
              color="bg-green-500/10 text-green-600 dark:text-green-400"
            />
            <KpiCard
              icon={<Siren className="h-5 w-5" />}
              label="Han tenido siniestro"
              value={`${
                stats.siniestro
                  .filter((s) => s.label !== "No, nunca")
                  .reduce((a, b) => a + b.count, 0)
              }`}
              sub={`${pct(
                stats.siniestro.filter((s) => s.label !== "No, nunca").reduce((a, b) => a + b.count, 0),
                stats.total
              )} del total`}
              color="bg-red-500/10 text-red-600 dark:text-red-400"
            />
          </div>

          {/* --- fila 1: tipo de conductor + sexo --- */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Respuestas por tipo de conductor" icon={<Users className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.byDriverType} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.byDriverType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribución por sexo" icon={<Users className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.bySex}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e) => `${e.label}: ${e.count}`}
                    labelLine={false}
                  >
                    {stats.bySex.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* --- fila 2: edad + casco --- */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Distribución por grupo de edad" icon={<Users className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={Object.entries(stats.ageGroups).map(([label, count]) => ({ label, count }))}
                  margin={{ left: -10, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Uso del casco" icon={<ShieldCheck className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  layout="vertical"
                  data={stats.casco}
                  margin={{ left: 40, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[3]} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* --- fila 3: licencia + siniestros --- */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Licencia de conducción" icon={<Bike className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  layout="vertical"
                  data={stats.licencia}
                  margin={{ left: 40, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[2]} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Experiencia con siniestros" icon={<Siren className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.siniestro}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e) => `${e.count}`}
                  >
                    {stats.siniestro.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* --- gravedad de siniestros --- */}
          {stats.siniestroGravedad.length > 0 && (
            <ChartCard
              title="Gravedad del siniestro más reciente"
              icon={<Siren className="h-4 w-4" />}
              description="Solo entre quienes reportaron un siniestro"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stats.siniestroGravedad}
                  margin={{ left: -10, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[5]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* --- causas y medidas --- */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Causas principales percibidas"
              icon={<Brain className="h-4 w-4" />}
              description="Selección múltiple"
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  layout="vertical"
                  data={stats.causasPrincipales}
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    width={150}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[5]} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Medidas consideradas más efectivas"
              icon={<Brain className="h-4 w-4" />}
              description="Selección múltiple"
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  layout="vertical"
                  data={stats.medidasEfectivas}
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    width={150}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[6]} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* --- percepciones (escalas) --- */}
          <div className="grid gap-4 lg:grid-cols-3">
            <ScaleCard
              title="Percepción de seguridad"
              avg={stats.avg.percepcionSeguridad}
              data={stats.percepcionSeguridad}
              color={COLORS[1]}
              labels={["Muy inseguro", "Muy seguro"]}
            />
            <ScaleCard
              title="Efectividad del control de tránsito"
              avg={stats.avg.efectividadControl}
              data={stats.efectividadControl}
              color={COLORS[3]}
              labels={["Nada efectivo", "Muy efectivo"]}
            />
            <ScaleCard
              title="Estado de las vías"
              avg={stats.avg.estadoVias}
              data={stats.estadoVias}
              color={COLORS[2]}
              labels={["Muy malo", "Muy bueno"]}
            />
          </div>

          {/* --- comportamientos de riesgo --- */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Uso del celular al conducir" icon={<Brain className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.usoCelular} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[6]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Conducción bajo efectos del alcohol" icon={<Brain className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.alcohol} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS[5]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ScaleCard({
  title,
  avg,
  data,
  color,
  labels,
}: {
  title: string;
  avg: number;
  data: Record<string, number>;
  color: string;
  labels: [string, string] | string[];
}) {
  const chartData = Object.entries(data).map(([k, v]) => ({ name: k, value: v }));
  const pctVal = (avg / 5) * 100;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">
          Promedio: <strong className="text-foreground">{avg.toFixed(2)} / 5</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={[{ name: title, value: pctVal, fill: color }]}
                startAngle={90}
                endAngle={90 - 360}
              >
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{avg.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground">/ 5</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-4 font-mono text-muted-foreground">{d.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${
                        chartData.reduce((s, x) => s + x.value, 0)
                          ? (d.value / chartData.reduce((s, x) => s + x.value, 0)) * 100
                          : 0
                      }%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="w-6 text-right font-mono">{d.value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1 text-[10px] text-muted-foreground">
              <span>{labels[0]}</span>
              <span>{labels[1]}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
