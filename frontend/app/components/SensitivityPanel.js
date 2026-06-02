"use client";

import { useState } from "react";
import axios from "axios";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SlidersHorizontal } from "lucide-react";

import {
  API_URL,
  buildBasePayload,
  formatNumber,
  VARIABLE_META,
} from "./component-helpers";

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="rounded-xl border px-3 py-2 text-sm shadow-lg"
      style={{
        borderColor: "var(--card-border)",
        background: "var(--tooltip-bg)",
        color: "var(--tooltip-text)",
      }}
    >
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={`${entry.dataKey}-${entry.name}`}>
          {entry.name}: {formatNumber(entry.value, 1)}
          {entry.unit ? ` ${entry.unit}` : ""}
        </p>
      ))}
    </div>
  );
}

export default function SensitivityPanel({ params, addToast }) {
  const [variable, setVariable] = useState("n_psikiyatrist");
  const [rangeState, setRangeState] = useState({
    min: 1,
    max: 5,
    step: 1,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVariableChange = (nextVariable) => {
    const meta = VARIABLE_META[nextVariable];
    setVariable(nextVariable);
    setRangeState({
      min: meta.min,
      max: meta.max,
      step: meta.step,
    });
  };

  const runSensitivity = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/duyarlilik`, {
        ...buildBasePayload(params),
        degisken: variable,
        aralik_min: Number(rangeState.min),
        aralik_max: Number(rangeState.max),
        aralik_adim: Number(rangeState.step),
      });
      setResult(response.data);
      addToast?.("Duyarlilik analizi tamamlandi.", "success");
    } catch (error) {
      addToast?.(
        error.response?.data?.detail || "Duyarlilik analizi calistirilamadi.",
        "error",
        6000,
      );
    } finally {
      setLoading(false);
    }
  };

  const bestResult = result?.sonuclar?.reduce((best, item) => {
    if (!best || item.ayrilma_orani < best.ayrilma_orani) {
      return item;
    }
    return best;
  }, null);

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Duyarlilik paneli
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Tek bir kaynagi degistirdiginizde ne oluyor?
          </h2>
          <p className="max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Secilen degisken belirli bir aralikta taranir ve her adimda sistemin yaniti
            olculur.
          </p>
        </div>
        <button
          type="button"
          onClick={runSensitivity}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 65%, #22c55e))",
          }}
        >
          <SlidersHorizontal size={16} />
          {loading ? "Calisiyor..." : "Taramayi baslat"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <label className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Degisken
          <select
            value={variable}
            onChange={(event) => handleVariableChange(event.target.value)}
            className="mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          >
            {Object.entries(VARIABLE_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Min
          <input
            type="number"
            min={VARIABLE_META[variable].min}
            max={VARIABLE_META[variable].max}
            value={rangeState.min}
            onChange={(event) =>
              setRangeState((prev) => ({ ...prev, min: event.target.value }))
            }
            className="mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </label>
        <label className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Max
          <input
            type="number"
            min={VARIABLE_META[variable].min}
            max={VARIABLE_META[variable].max}
            value={rangeState.max}
            onChange={(event) =>
              setRangeState((prev) => ({ ...prev, max: event.target.value }))
            }
            className="mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </label>
        <label className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Adim
          <input
            type="number"
            min={1}
            max={2}
            value={rangeState.step}
            onChange={(event) =>
              setRangeState((prev) => ({ ...prev, step: event.target.value }))
            }
            className="mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </label>
      </div>

      {result ? (
        <div className="mt-5 space-y-5">
          {bestResult ? (
            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--card-border)",
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), var(--card))",
              }}
            >
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                En iyi nokta
              </p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {VARIABLE_META[variable].label}: {bestResult.deger}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Ayrilma %{formatNumber(bestResult.ayrilma_orani, 1)} ve ortalama bekleme{" "}
                {formatNumber(bestResult.ort_bekleme, 1)} dakika.
              </p>
            </div>
          ) : null}

          <div className="rounded-3xl border p-4" style={{ borderColor: "var(--card-border)" }}>
            <div className="mb-4 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.sonuclar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
                  <XAxis dataKey="deger" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <Tooltip content={<TooltipBox />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="ort_bekleme"
                    name="Ort. bekleme"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    unit=" dk"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ayrilma_orani"
                    name="Ayrilma"
                    stroke="#ef4444"
                    strokeWidth={2}
                    unit=" %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="mt-5 rounded-3xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}
        >
          Duyarlilik trendini gormek icin paneli calistirin.
        </div>
      )}
    </section>
  );
}
