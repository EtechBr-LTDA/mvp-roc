"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapPin,
  Spinner,
  ArrowClockwise,
  GlobeHemisphereWest,
} from "@phosphor-icons/react";
import { adminApi } from "../../lib/api";

import * as echarts from "echarts/core";
import { MapChart, BarChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  MapChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface LocationStats {
  city?: string;
  state?: string;
  state_name?: string;
  unique_users: number;
  total_events: number;
}

interface GeoStatsResponse {
  totals: {
    unique_users: number;
    total_events: number;
    new_users: number;
    returning_users: number;
  };
  cities: LocationStats[];
  other_states: LocationStats[];
  all_states: LocationStats[];
  weekly_trend: {
    week: string;
    unique_users: number;
    total_events: number;
    new_users: number;
  }[];
}

type MapView = "rondonia" | "brasil";
type Metric = "unique_users" | "total_events";

// Mapa de sigla (codigo IPWHOIS region_code) -> nome no GeoJSON IBGE
const SIGLA_TO_GEO_NAME: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapa", AM: "Amazonas",
  BA: "Bahia", CE: "Ceara", DF: "Distrito Federal", ES: "Espirito Santo",
  GO: "Goias", MA: "Maranhao", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Para", PB: "Paraiba", PR: "Parana",
  PE: "Pernambuco", PI: "Piaui", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondonia", RR: "Roraima", SC: "Santa Catarina",
  SP: "Sao Paulo", SE: "Sergipe", TO: "Tocantins",
};

function resolveStateName(state: string, stateName?: string): string {
  return SIGLA_TO_GEO_NAME[state] || stateName || state;
}

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function GeoDistributionPage() {
  const [stats, setStats] = useState<GeoStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [mapView, setMapView] = useState<MapView>("rondonia");
  const [metric, setMetric] = useState<Metric>("unique_users");
  const [roMapReady, setRoMapReady] = useState(false);
  const [brMapReady, setBrMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const trendRef = useRef<HTMLDivElement>(null);
  const mapChartRef = useRef<echarts.ECharts | null>(null);
  const barChartRef = useRef<echarts.ECharts | null>(null);
  const trendChartRef = useRef<echarts.ECharts | null>(null);

  // Load GeoJSON files
  useEffect(() => {
    fetch("/rondonia-municipios.json")
      .then((r) => r.json())
      .then((geo) => {
        echarts.registerMap("rondonia", geo as any);
        setRoMapReady(true);
      })
      .catch((err) => console.error("Erro ao carregar GeoJSON Rondonia:", err));

    fetch("/brasil-estados.json")
      .then((r) => r.json())
      .then((geo) => {
        echarts.registerMap("brasil", geo as any);
        setBrMapReady(true);
      })
      .catch((err) => console.error("Erro ao carregar GeoJSON Brasil:", err));
  }, []);

  const currentMapReady = mapView === "rondonia" ? roMapReady : brMapReady;

  // Load data when period changes
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getGeoStats({ days: period });
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar geo stats:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!roMapReady) return;
    loadData();
  }, [roMapReady, loadData]);

  const metricLabel = metric === "unique_users" ? "usuarios unicos" : "acessos";

  // Render map chart
  useEffect(() => {
    if (!currentMapReady || !stats || !mapRef.current) return;

    if (!mapChartRef.current) {
      mapChartRef.current = echarts.init(mapRef.current);
    }

    if (mapView === "rondonia") {
      const cityData = stats.cities.map((c) => ({
        name: c.city || "",
        value: c[metric],
        _unique: c.unique_users,
        _events: c.total_events,
      }));

      const maxVal = Math.max(...cityData.map((c) => c.value), 1);

      mapChartRef.current.setOption({
        tooltip: {
          trigger: "item",
          formatter: (params: any) => {
            const d = params.data;
            if (!d) return `<strong>${params.name}</strong><br/>0`;
            return `<strong>${params.name}</strong><br/>${d._unique} usuarios<br/>${d._events} acessos`;
          },
        },
        visualMap: {
          min: 0,
          max: maxVal,
          text: ["Alto", "Baixo"],
          inRange: { color: ["#e0f2fe", "#0369a1"] },
          calculable: true,
          left: "left",
          bottom: 20,
        },
        series: [{
          type: "map",
          map: "rondonia",
          roam: true,
          data: cityData,
          label: { show: true, fontSize: 7, color: "#475569" },
          emphasis: {
            label: { show: true, fontSize: 11, fontWeight: "bold" },
            itemStyle: { areaColor: "#fbbf24" },
          },
          itemStyle: { borderColor: "#94a3b8", borderWidth: 0.5 },
          select: { disabled: true },
        }],
      }, { notMerge: true });
    } else {
      const stateData = stats.all_states.map((s) => ({
        name: resolveStateName(s.state || "", s.state_name),
        value: s[metric],
        _unique: s.unique_users,
        _events: s.total_events,
      }));

      const maxVal = Math.max(...stateData.map((d) => d.value), 1);

      mapChartRef.current.setOption({
        tooltip: {
          trigger: "item",
          formatter: (params: any) => {
            const d = params.data;
            if (!d) return `<strong>${params.name}</strong><br/>0`;
            return `<strong>${params.name}</strong><br/>${d._unique} usuarios<br/>${d._events} acessos`;
          },
        },
        visualMap: {
          min: 0,
          max: maxVal,
          text: ["Alto", "Baixo"],
          inRange: { color: ["#e0f2fe", "#0369a1"] },
          calculable: true,
          left: "left",
          bottom: 20,
        },
        series: [{
          type: "map",
          map: "brasil",
          roam: true,
          data: stateData,
          nameProperty: "name",
          label: { show: true, fontSize: 8, color: "#475569" },
          emphasis: {
            label: { show: true, fontSize: 12, fontWeight: "bold" },
            itemStyle: { areaColor: "#fbbf24" },
          },
          itemStyle: { borderColor: "#94a3b8", borderWidth: 0.5 },
          select: { disabled: true },
        }],
      }, { notMerge: true });
    }
  }, [currentMapReady, mapView, stats, metric, metricLabel]);

  // Render bar chart
  useEffect(() => {
    if (!stats || !barRef.current) return;

    if (!barChartRef.current) {
      barChartRef.current = echarts.init(barRef.current);
    }

    if (mapView === "rondonia") {
      const sortedCities = [...stats.cities].sort((a, b) => a[metric] - b[metric]);
      const otherTotal = stats.other_states.reduce((sum, s) => sum + s[metric], 0);
      const hasOther = otherTotal > 0;

      const barLabels = hasOther
        ? ["Outros Estados", ...sortedCities.map((c) => c.city || "")]
        : sortedCities.map((c) => c.city || "");
      const barValues = hasOther
        ? [otherTotal, ...sortedCities.map((c) => c[metric])]
        : sortedCities.map((c) => c[metric]);

      barChartRef.current.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params: any) => {
            const item = Array.isArray(params) ? params[0] : params;
            if (item.name === "Outros Estados" && stats.other_states.length > 0) {
              const lines = [...stats.other_states]
                .sort((a, b) => b[metric] - a[metric])
                .map((s) => `${resolveStateName(s.state || "", s.state_name)}: ${s.unique_users} usu. / ${s.total_events} acessos`)
                .join("<br/>");
              return `<strong>Outros Estados</strong><br/>${lines}`;
            }
            const city = stats.cities.find((c) => c.city === item.name);
            if (city) {
              return `<strong>${item.name}</strong><br/>${city.unique_users} usuarios<br/>${city.total_events} acessos`;
            }
            return `<strong>${item.name}</strong><br/>${item.value} ${metricLabel}`;
          },
        },
        grid: { left: "2%", right: "10%", top: 10, bottom: 10, containLabel: true },
        xAxis: { type: "value", axisLabel: { fontSize: 11 } },
        yAxis: {
          type: "category",
          data: barLabels,
          axisLabel: { fontSize: 10, width: 120, overflow: "truncate" },
        },
        series: [{
          type: "bar",
          data: barValues.map((val, i) => ({
            value: val,
            itemStyle: { color: barLabels[i] === "Outros Estados" ? "#94a3b8" : "#0369a1" },
          })),
          barMaxWidth: 24,
          label: { show: true, position: "right", fontSize: 10, color: "#475569" },
        }],
      }, { notMerge: true });
    } else {
      const sortedStates = [...stats.all_states].sort((a, b) => a[metric] - b[metric]);
      const barLabels = sortedStates.map((s) => resolveStateName(s.state || "", s.state_name));
      const barValues = sortedStates.map((s) => s[metric]);

      barChartRef.current.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params: any) => {
            const item = Array.isArray(params) ? params[0] : params;
            const state = stats.all_states.find(
              (s) => resolveStateName(s.state || "", s.state_name) === item.name
            );
            if (state) {
              return `<strong>${item.name}</strong><br/>${state.unique_users} usuarios<br/>${state.total_events} acessos`;
            }
            return `<strong>${item.name}</strong><br/>${item.value} ${metricLabel}`;
          },
        },
        grid: { left: "2%", right: "10%", top: 10, bottom: 10, containLabel: true },
        xAxis: { type: "value", axisLabel: { fontSize: 11 } },
        yAxis: {
          type: "category",
          data: barLabels,
          axisLabel: { fontSize: 10, width: 140, overflow: "truncate" },
        },
        series: [{
          type: "bar",
          data: barValues.map((val, i) => ({
            value: val,
            itemStyle: {
              color: barLabels[i] === "Rondonia" ? "#0369a1" : "#64748b",
            },
          })),
          barMaxWidth: 24,
          label: { show: true, position: "right", fontSize: 10, color: "#475569" },
        }],
      }, { notMerge: true });
    }
  }, [stats, mapView, metric, metricLabel]);

  // Render trend chart
  useEffect(() => {
    if (!stats || !stats.weekly_trend.length || !trendRef.current) return;

    if (!trendChartRef.current) {
      trendChartRef.current = echarts.init(trendRef.current);
    }

    const weeks = stats.weekly_trend.map((w) => {
      const d = new Date(w.week);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    });

    trendChartRef.current.setOption({
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const header = items[0]?.axisValue || "";
          const lines = items
            .map(
              (p: any) =>
                `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:5px"></span>${p.seriesName}: ${p.value}`
            )
            .join("<br/>");
          return `<strong>Semana de ${header}</strong><br/>${lines}`;
        },
      },
      legend: {
        data: ["Usuarios Unicos", "Novos Usuarios"],
        bottom: 0,
        textStyle: { fontSize: 11, color: "#64748b" },
      },
      grid: { left: "3%", right: "4%", top: 15, bottom: 35, containLabel: true },
      xAxis: {
        type: "category",
        data: weeks,
        axisLabel: { fontSize: 10, color: "#64748b" },
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        axisLabel: { fontSize: 10, color: "#64748b" },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: "Usuarios Unicos",
          type: "line",
          data: stats.weekly_trend.map((w) => w.unique_users),
          smooth: true,
          lineStyle: { width: 2, color: "#0369a1" },
          itemStyle: { color: "#0369a1" },
          areaStyle: { color: "rgba(3, 105, 161, 0.08)" },
        },
        {
          name: "Novos Usuarios",
          type: "line",
          data: stats.weekly_trend.map((w) => w.new_users),
          smooth: true,
          lineStyle: { width: 2, color: "#059669", type: "dashed" },
          itemStyle: { color: "#059669" },
        },
      ],
    }, { notMerge: true });
  }, [stats]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      mapChartRef.current?.resize();
      barChartRef.current?.resize();
      trendChartRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      mapChartRef.current?.dispose();
      barChartRef.current?.dispose();
      trendChartRef.current?.dispose();
    };
  }, []);

  // Subtexto: Rondonia mostra dados de RO, Brasil mostra geral
  const roState = stats?.all_states.find((s) => s.state === "RO");
  const subtitleCount = mapView === "rondonia"
    ? (roState?.[metric] ?? 0)
    : stats?.totals[metric] ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-roc-primary)] text-white">
            <MapPin size={20} weight="bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-dark)]">
              Distribuicao Geografica
            </h1>
            <p className="text-sm text-[var(--color-text-light)]">
              {mapView === "rondonia" ? "Rondonia" : "Brasil"} &middot;{" "}
              {stats ? `${subtitleCount} ${metricLabel}` : "..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Map view toggle */}
          <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
            <button
              onClick={() => setMapView("rondonia")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                mapView === "rondonia"
                  ? "bg-[var(--color-roc-primary)] text-white"
                  : "bg-white text-[var(--color-text-light)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              <MapPin size={14} />
              Rondonia
            </button>
            <button
              onClick={() => setMapView("brasil")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                mapView === "brasil"
                  ? "bg-[var(--color-roc-primary)] text-white"
                  : "bg-white text-[var(--color-text-light)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              <GlobeHemisphereWest size={14} />
              Brasil
            </button>
          </div>

          {/* Metric toggle */}
          <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
            <button
              onClick={() => setMetric("unique_users")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                metric === "unique_users"
                  ? "bg-[var(--color-roc-primary)] text-white"
                  : "bg-white text-[var(--color-text-light)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setMetric("total_events")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                metric === "total_events"
                  ? "bg-[var(--color-roc-primary)] text-white"
                  : "bg-white text-[var(--color-text-light)] hover:bg-[var(--color-bg-secondary)]"
              }`}
            >
              Acessos
            </button>
          </div>

          {/* Period selector */}
          <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => setPeriod(p.days)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === p.days
                    ? "bg-[var(--color-roc-primary)] text-white"
                    : "bg-white text-[var(--color-text-light)] hover:bg-[var(--color-bg-secondary)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-text-light)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50"
          >
            <ArrowClockwise size={14} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && !stats && (
        <div className="flex h-96 items-center justify-center">
          <Spinner size={32} className="animate-spin text-[var(--color-roc-primary)]" />
        </div>
      )}

      {/* Charts grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Map */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-dark)]">
              {mapView === "rondonia"
                ? "Mapa de Calor - Rondonia"
                : "Mapa de Calor - Brasil"}
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({metric === "unique_users" ? "usuarios unicos" : "total de acessos"})
              </span>
            </h2>
            <div ref={mapRef} style={{ width: "100%", height: 700 }} />
          </div>

          {/* Ranking */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-dark)]">
              {mapView === "rondonia"
                ? "Ranking por Cidade"
                : "Ranking por Estado"}
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({metric === "unique_users" ? "usuarios unicos" : "total de acessos"})
              </span>
            </h2>
            <div ref={barRef} style={{ width: "100%", height: 700 }} />
          </div>
        </div>
      )}

      {/* Weekly trend */}
      {stats && stats.weekly_trend.length > 0 && (
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-dark)]">
            Tendencia Semanal
          </h2>
          <div ref={trendRef} style={{ width: "100%", height: 280 }} />
        </div>
      )}

      {/* Empty state */}
      {!loading && stats && stats.totals.total_events === 0 && (
        <div className="mt-8 text-center">
          <MapPin size={48} className="mx-auto mb-3 text-[var(--color-text-light)]" />
          <p className="text-sm text-[var(--color-text-light)]">
            Nenhum dado de geolocalizacao no periodo selecionado.
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-light)]">
            Os dados sao coletados automaticamente a cada login de usuario.
          </p>
        </div>
      )}
    </div>
  );
}
