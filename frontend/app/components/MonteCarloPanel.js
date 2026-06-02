"use client";

import { useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Dices, Sigma } from "lucide-react";

import {
  API_URL,
  buildBasePayload,
  formatNumber,
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

function MetricCard({ label, stat, unit = "" }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
    >
      <p className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {formatNumber(stat?.ortalama, 2)}
        {unit}
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
        %95 GA: {formatNumber(stat?.ci_alt, 2)} - {formatNumber(stat?.ci_ust, 2)}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        Std sapma: {formatNumber(stat?.std, 2)}
      </p>
    </div>
  );
}

export default function MonteCarloPanel({ params, addToast }) {
  const [repeatCount, setRepeatCount] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/monte-carlo`, {
        ...buildBasePayload(params),
        n_tekrar: Number(repeatCount),
      });
      setResult(response.data);
      addToast?.("Monte Carlo analizi tamamlandi.", "success");
    } catch (error) {
      addToast?.(
        error.response?.data?.detail || "Monte Carlo analizi calistirilamadi.",
        "error",
        6000,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Monte Carlo paneli
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Sonuclarin istatistiksel guvenilirligini test edin
          </h2>
          <p className="max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Ayni parametre setini tekrarlayarak bekleme, ayrilma ve hasta hacminin ne kadar
            oynadigini olcun.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Tekrar sayisi
            <input
              type="number"
              min={5}
              max={100}
              step={1}
              value={repeatCount}
              onChange={(event) => setRepeatCount(event.target.value)}
              className="mt-1 block w-24 rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
            />
          </label>
          <button
            type="button"
            onClick={runAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #8b5cf6))",
            }}
          >
            <Dices size={16} />
            {loading ? "Calisiyor..." : "Analizi baslat"}
          </button>
        </div>
      </div>

      {result ? (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Ort. bekleme" stat={result.bekleme} unit=" dk" />
            <MetricCard label="Ayrilma orani" stat={result.ayrilma} unit=" %" />
            <MetricCard label="Toplam hasta" stat={result.hasta} />
            <MetricCard label="Triyaj bekleme" stat={result.triaj_bekleme} unit=" dk" />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-3xl border p-4" style={{ borderColor: "var(--card-border)" }}>
              <div className="mb-4 flex items-center gap-2">
                <Sigma size={16} style={{ color: "var(--primary)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Bekleme histogrami
                </h3>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.histogram_bekleme}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
                    <XAxis dataKey="aralik" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                    <Tooltip content={<TooltipBox />} />
                    <Bar dataKey="sayi" name="Tekrar" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-3xl border p-4" style={{ borderColor: "var(--card-border)" }}>
              <div className="mb-4 flex items-center gap-2">
                <Sigma size={16} style={{ color: "var(--primary)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Tekrar bazli trend
                </h3>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.tum_sonuclar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
                    <XAxis dataKey="tekrar" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                    <Tooltip content={<TooltipBox />} />
                    <Line
                      type="monotone"
                      dataKey="bekleme"
                      name="Ort. bekleme"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={false}
                      unit=" dk"
                    />
                    <Line
                      type="monotone"
                      dataKey="ayrilma"
                      name="Ayrilma"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      unit=" %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div
          className="mt-5 rounded-3xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}
        >
          Tekrarlı analiz sonucunu gormek icin paneli calistirin.
        </div>
      )}
    </section>
  );
}
