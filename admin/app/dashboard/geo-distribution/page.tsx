"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, Spinner, ArrowClockwise, GlobeHemisphereWest } from "@phosphor-icons/react";
import { adminApi } from "../../lib/api";

import * as echarts from "echarts/core";
import { MapChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  MapChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  CanvasRenderer,
]);

interface CityStats {
  city: string;
  count: number;
}

interface OtherStateStats {
  state: string;
  state_name: string;
  count: number;
}

interface GeoStatsResponse {
  cities: CityStats[];
  otherStates: OtherStateStats[];
  otherStatesTotal: number;
  total: number;
}

type MapView = "rondonia" | "brasil";

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

function resolveStateName(state: string, stateName: string): string {
  return SIGLA_TO_GEO_NAME[state] || stateName;
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
  const [roMapReady, setRoMapReady] = useState(false);
  const [brMapReady, setBrMapReady] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const mapChartRef = useRef<echarts.ECharts | null>(null);
  const barChartRef = useRef<echarts.ECharts | null>(null);

  // Load GeoJSON files
  useEffect(() => {
    fetch("/rondonia-municipios.json")
      .then((r) => r.json())
      .then((geo) => {
        echarts.registerMap("rondonia", geo as any);
        setRoMapReady(true);
      })
      .catch((err) => {
        console.error("Erro ao carregar GeoJSON Rondonia:", err);
      });

    fetch("/brasil-estados.json")
      .then((r) => r.json())
      .then((geo) => {
        echarts.registerMap("brasil", geo as any);
        setBrMapReady(true);
      })
      .catch((err) => {
        console.error("Erro ao carregar GeoJSON Brasil:", err);
      });
  }, []);

  const currentMapReady = mapView === "rondonia" ? roMapReady : brMapReady;

  // Load data when period changes
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Track admin IP first, then load stats
      await adminApi.trackGeoIp().catch(() => {});
      const data = await adminApi.getGeoStats(period);
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

  // Render map chart
  useEffect(() => {
    if (!currentMapReady || !stats || !mapRef.current) return;

    if (mapChartRef.current) {
      mapChartRef.current.dispose();
      mapChartRef.current = null;
    }

    mapChartRef.current = echarts.init(mapRef.current);

    if (mapView === "rondonia") {
      const cityData = stats.cities.map((c) => ({
        name: c.city,
        value: c.count,
      }));

      const maxCount = Math.max(...stats.cities.map((c) => c.count), 1);

      mapChartRef.current.setOption({
        tooltip: {
          trigger: "item",
          formatter: (params: any) => {
            const val = typeof params.value === "number" && !isNaN(params.value) ? params.value : 0;
            return `<strong>${params.name}</strong><br/>${val} acessos`;
          },
        },
        visualMap: {
          min: 0,
          max: maxCount,
          text: ["Alto", "Baixo"],
          inRange: {
            color: ["#e0f2fe", "#0369a1"],
          },
          calculable: true,
          left: "left",
          bottom: 20,
        },
        series: [
          {
            type: "map",
            map: "rondonia",
            roam: true,
            data: cityData,
            label: {
              show: true,
              fontSize: 7,
              color: "#475569",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 11,
                fontWeight: "bold",
              },
              itemStyle: {
                areaColor: "#fbbf24",
              },
            },
            itemStyle: {
              borderColor: "#94a3b8",
              borderWidth: 0.5,
            },
            select: {
              disabled: true,
            },
          },
        ],
      });
    } else {
      // Brazil states map
      const roTotal = stats.cities.reduce((sum, c) => sum + c.count, 0);

      const stateData: { name: string; value: number }[] = [];

      if (roTotal > 0) {
        stateData.push({ name: "Rondonia", value: roTotal });
      }

      for (const s of stats.otherStates) {
        stateData.push({ name: resolveStateName(s.state, s.state_name), value: s.count });
      }

      const allValues = stateData.map((d) => d.value);
      const maxCount = Math.max(...allValues, 1);

      mapChartRef.current.setOption({
        tooltip: {
          trigger: "item",
          formatter: (params: any) => {
            const val = typeof params.value === "number" && !isNaN(params.value) ? params.value : 0;
            return `<strong>${params.name}</strong><br/>${val} acessos`;
          },
        },
        visualMap: {
          min: 0,
          max: maxCount,
          text: ["Alto", "Baixo"],
          inRange: {
            color: ["#e0f2fe", "#0369a1"],
          },
          calculable: true,
          left: "left",
          bottom: 20,
        },
        series: [
          {
            type: "map",
            map: "brasil",
            roam: true,
            data: stateData,
            nameProperty: "name",
            label: {
              show: true,
              fontSize: 8,
              color: "#475569",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 12,
                fontWeight: "bold",
              },
              itemStyle: {
                areaColor: "#fbbf24",
              },
            },
            itemStyle: {
              borderColor: "#94a3b8",
              borderWidth: 0.5,
            },
            select: {
              disabled: true,
            },
          },
        ],
      });
    }
  }, [currentMapReady, mapView, stats]);

  // Render bar chart
  useEffect(() => {
    if (!stats || !barRef.current) return;

    if (barChartRef.current) {
      barChartRef.current.dispose();
      barChartRef.current = null;
    }

    barChartRef.current = echarts.init(barRef.current);

    if (mapView === "rondonia") {
      const sortedCities = [...stats.cities].sort((a, b) => a.count - b.count);

      const hasOther = stats.otherStatesTotal > 0;
      const barLabels = hasOther
        ? ["Outros Estados", ...sortedCities.map((c) => c.city)]
        : sortedCities.map((c) => c.city);
      const barValues = hasOther
        ? [stats.otherStatesTotal, ...sortedCities.map((c) => c.count)]
        : sortedCities.map((c) => c.count);

      const otherStates = stats.otherStates;
      const otherStatesTotal = stats.otherStatesTotal;

      barChartRef.current.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params: any) => {
            const item = Array.isArray(params) ? params[0] : params;
            if (item.name === "Outros Estados" && otherStates.length > 0) {
              const lines = otherStates
                .map((s) => `${s.state_name}: ${s.count}`)
                .join("<br/>");
              return `<strong>Outros Estados (${otherStatesTotal})</strong><br/>${lines}`;
            }
            return `<strong>${item.name}</strong><br/>${item.value} acessos`;
          },
        },
        grid: {
          left: "2%",
          right: "10%",
          top: 10,
          bottom: 10,
          containLabel: true,
        },
        xAxis: {
          type: "value",
          axisLabel: { fontSize: 11 },
        },
        yAxis: {
          type: "category",
          data: barLabels,
          axisLabel: {
            fontSize: 10,
            width: 120,
            overflow: "truncate",
          },
        },
        series: [
          {
            type: "bar",
            data: barValues.map((val, i) => ({
              value: val,
              itemStyle: {
                color:
                  barLabels[i] === "Outros Estados" ? "#94a3b8" : "#0369a1",
              },
            })),
            barMaxWidth: 24,
            label: {
              show: true,
              position: "right",
              fontSize: 10,
              color: "#475569",
            },
          },
        ],
      });
    } else {
      // States ranking
      const roTotal = stats.cities.reduce((sum, c) => sum + c.count, 0);

      const allStates: { name: string; count: number }[] = [];
      if (roTotal > 0) {
        allStates.push({ name: "Rondonia", count: roTotal });
      }
      for (const s of stats.otherStates) {
        allStates.push({ name: resolveStateName(s.state, s.state_name), count: s.count });
      }

      const sortedStates = [...allStates].sort((a, b) => a.count - b.count);
      const barLabels = sortedStates.map((s) => s.name);
      const barValues = sortedStates.map((s) => s.count);

      barChartRef.current.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params: any) => {
            const item = Array.isArray(params) ? params[0] : params;
            return `<strong>${item.name}</strong><br/>${item.value} acessos`;
          },
        },
        grid: {
          left: "2%",
          right: "10%",
          top: 10,
          bottom: 10,
          containLabel: true,
        },
        xAxis: {
          type: "value",
          axisLabel: { fontSize: 11 },
        },
        yAxis: {
          type: "category",
          data: barLabels,
          axisLabel: {
            fontSize: 10,
            width: 140,
            overflow: "truncate",
          },
        },
        series: [
          {
            type: "bar",
            data: barValues.map((val, i) => ({
              value: val,
              itemStyle: {
                color:
                  barLabels[i] === "Rondonia" ? "#0369a1" : "#64748b",
              },
            })),
            barMaxWidth: 24,
            label: {
              show: true,
              position: "right",
              fontSize: 10,
              color: "#475569",
            },
          },
        ],
      });
    }
  }, [stats, mapView]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      mapChartRef.current?.resize();
      barChartRef.current?.resize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      mapChartRef.current?.dispose();
      barChartRef.current?.dispose();
    };
  }, []);

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
              {stats ? stats.total : "..."} acessos
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
            </h2>
            <div ref={mapRef} style={{ width: "100%", height: 700 }} />
          </div>

          {/* Ranking */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-dark)]">
              {mapView === "rondonia"
                ? "Ranking por Cidade"
                : "Ranking por Estado"}
            </h2>
            <div ref={barRef} style={{ width: "100%", height: 700 }} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && stats && stats.total === 0 && (
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
