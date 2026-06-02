"use client";

import { useState } from "react";
import axios from "axios";
import { Grid2x2 } from "lucide-react";

import {
  API_URL,
  buildBasePayload,
  formatNumber,
  getHeatColor,
  VARIABLE_META,
} from "./component-helpers";

export default function HeatmapPanel({ params, addToast }) {
  const [variableX, setVariableX] = useState("n_psikiyatrist");
  const [variableY, setVariableY] = useState("n_psikolog");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runHeatmap = async () => {
    if (variableX === variableY) {
      addToast?.("Heatmap icin iki farkli degisken secin.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/heatmap`, {
        ...buildBasePayload(params),
        degisken1: variableX,
        degisken2: variableY,
      });
      setResult(response.data);
      addToast?.("Heatmap verisi hazirlandi.", "success");
    } catch (error) {
      addToast?.(
        error.response?.data?.detail || "Heatmap analizi calistirilamadi.",
        "error",
        6000,
      );
    } finally {
      setLoading(false);
    }
  };

  const allValues =
    result?.matris?.flatMap((row) => row.degerler.map((item) => item.ayrilma_orani)) || [];
  const maxValue = Math.max(...allValues, 0);

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Heatmap paneli
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Iki parametrenin birlikte etkisini gorun
          </h2>
          <p className="max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Renk yogunlugu ayrilma oranini, kutu icindeki ikincil bilgi ise ortalama bekleme
            suresini temsil eder.
          </p>
        </div>
        <button
          type="button"
          onClick={runHeatmap}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 68%, #ec4899))",
          }}
        >
          <Grid2x2 size={16} />
          {loading ? "Olculuyor..." : "Heatmap olustur"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Yatay eksen
          <select
            value={variableX}
            onChange={(event) => setVariableX(event.target.value)}
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
          Dikey eksen
          <select
            value={variableY}
            onChange={(event) => setVariableY(event.target.value)}
            className="mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          >
            {Object.entries(VARIABLE_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {result ? (
        <div className="mt-5 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Her kutuda ustte ayrilma %, altta ortalama bekleme bulunur.
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>Dususk risk</span>
              <div
                className="h-2 w-28 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(160 82% 48%), hsl(20 82% 38%))",
                }}
              />
              <span>Yuksek risk</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div
              className="grid min-w-[46rem] gap-2"
              style={{
                gridTemplateColumns: `120px repeat(${result.matris?.[0]?.degerler?.length || 0}, minmax(90px, 1fr))`,
              }}
            >
              <div />
              {result.matris?.[0]?.degerler?.map((cell) => (
                <div
                  key={`header-${cell.d2}`}
                  className="rounded-xl border px-3 py-2 text-center text-sm font-semibold"
                  style={{ borderColor: "var(--card-border)", color: "var(--text-primary)" }}
                >
                  {VARIABLE_META[result.degisken2].shortLabel} {cell.d2}
                </div>
              ))}

              {result.matris?.map((row) => (
                row.degerler.map((cell, index) => (
                  <div key={`${row.d1}-${cell.d2}`} className="contents">
                    {index === 0 ? (
                      <div
                        className="flex items-center rounded-xl border px-3 py-2 text-sm font-semibold"
                        style={{ borderColor: "var(--card-border)", color: "var(--text-primary)" }}
                      >
                        {VARIABLE_META[result.degisken1].shortLabel} {row.d1}
                      </div>
                    ) : null}
                    <div
                      className="rounded-2xl p-3 text-center shadow-sm"
                      style={{
                        background: getHeatColor(cell.ayrilma_orani, maxValue || 1),
                        color: "#ffffff",
                      }}
                    >
                      <p className="text-lg font-semibold">
                        %{formatNumber(cell.ayrilma_orani, 1)}
                      </p>
                      <p className="mt-1 text-xs opacity-85">
                        {formatNumber(cell.ort_bekleme, 1)} dk
                      </p>
                    </div>
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="mt-5 rounded-3xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}
        >
          Iki boyutlu etki haritasini gormek icin paneli calistirin.
        </div>
      )}
    </section>
  );
}
