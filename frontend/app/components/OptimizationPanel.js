"use client";

import { useState } from "react";
import axios from "axios";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BadgeDollarSign, Sparkles } from "lucide-react";

import { API_URL, buildBasePayload, formatNumber } from "./component-helpers";

function TooltipBox({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-sm shadow-lg"
      style={{
        borderColor: "var(--card-border)",
        background: "var(--tooltip-bg)",
        color: "var(--tooltip-text)",
      }}
    >
      <p className="font-medium">
        H {point.n_triaj_hemsire} / Ps {point.n_psikiyatrist} / Pg {point.n_psikolog} / Y {point.n_gozlem_yatagi}
      </p>
      <p>Ayrilma: %{formatNumber(point.ayrilma_orani, 1)}</p>
      <p>Bekleme: {formatNumber(point.ort_bekleme, 1)} dk</p>
      <p>Maliyet: {formatNumber(point.gunluk_maliyet)} TL</p>
    </div>
  );
}

export default function OptimizationPanel({ params, addToast }) {
  const [formState, setFormState] = useState({
    hedef_ayrilma_orani: 5,
    hemsire_maliyet: 250,
    psikiyatrist_maliyet: 800,
    psikolog_maliyet: 400,
    yatak_maliyet: 150,
    max_hemsire: 4,
    max_psikiyatrist: 3,
    max_psikolog: 4,
    max_yatak: 6,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/optimizasyon`, {
        ...buildBasePayload(params),
        ...Object.fromEntries(
          Object.entries(formState).map(([key, value]) => [key, Number(value)]),
        ),
      });
      setResult(response.data);
      addToast?.("Optimizasyon tamamlandi.", "success");
    } catch (error) {
      addToast?.(
        error.response?.data?.detail || "Optimizasyon calistirilamadi.",
        "error",
        6000,
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Optimizasyon paneli
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Hedef ayrilma oranina gore en dengeli kadroyu bulun
          </h2>
          <p className="max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Brute-force tarama ile maliyet ve performans dengesi acisindan en uygun kaynak
            kombinasyonu onerilir.
          </p>
        </div>
        <button
          type="button"
          onClick={runOptimization}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 64%, #f97316))",
          }}
        >
          <Sparkles size={16} />
          {loading ? "Taranıyor..." : "Optimizasyonu calistir"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["hedef_ayrilma_orani", "Hedef ayrilma %"],
          ["max_hemsire", "Maks hemsire"],
          ["max_psikiyatrist", "Maks psikiyatrist"],
          ["max_psikolog", "Maks psikolog"],
          ["max_yatak", "Maks yatak"],
          ["hemsire_maliyet", "Hemsire maliyeti"],
          ["psikiyatrist_maliyet", "Psikiyatrist maliyeti"],
          ["psikolog_maliyet", "Psikolog maliyeti"],
        ].map(([key, label]) => (
          <label key={key} className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {label}
            <input
              type="number"
              value={formState[key]}
              onChange={(event) => updateField(key, event.target.value)}
              className="mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
            />
          </label>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Yatak maliyeti
          <input
            type="number"
            value={formState.yatak_maliyet}
            onChange={(event) => updateField("yatak_maliyet", event.target.value)}
            className="mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </label>
      </div>

      {result ? (
        <div className="mt-5 space-y-5">
          <div
            className="rounded-3xl border p-5"
            style={{
              borderColor: "var(--card-border)",
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, transparent), var(--card))",
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                  En iyi konfigurasyon
                </p>
                <h3 className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  H {result.en_iyi.n_triaj_hemsire} / Ps {result.en_iyi.n_psikiyatrist} / Pg{" "}
                  {result.en_iyi.n_psikolog} / Y {result.en_iyi.n_gozlem_yatagi}
                </h3>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  Ayrilma %{formatNumber(result.en_iyi.ayrilma_orani, 1)}, bekleme{" "}
                  {formatNumber(result.en_iyi.ort_bekleme, 1)} dakika ve gunluk maliyet{" "}
                  {formatNumber(result.en_iyi.gunluk_maliyet)} TL.
                </p>
              </div>
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)" }}
              >
                <div className="flex items-center gap-2" style={{ color: "var(--primary)" }}>
                  <BadgeDollarSign size={18} />
                  <span className="text-sm font-semibold">
                    {result.hedef_karsilandi
                      ? `${result.uygun_kombinasyon_sayisi} uygun kombinasyon`
                      : "Hedefi tam karsilayan kombinasyon yok"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-3xl border p-4" style={{ borderColor: "var(--card-border)" }}>
              <div className="mb-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
                    <XAxis
                      type="number"
                      dataKey="gunluk_maliyet"
                      name="Maliyet"
                      unit=" TL"
                      stroke="var(--text-muted)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="number"
                      dataKey="ayrilma_orani"
                      name="Ayrilma"
                      unit="%"
                      stroke="var(--text-muted)"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<TooltipBox />} />
                    <Scatter data={result.tum_sonuclar} fill="#4f46e5" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-3xl border p-4" style={{ borderColor: "var(--card-border)" }}>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Alternatifler
              </h3>
              <div className="mt-4 space-y-3">
                {result.alternatifler?.map((item, index) => (
                  <div
                    key={`${item.n_triaj_hemsire}-${item.n_psikiyatrist}-${index}`}
                    className="rounded-2xl border p-3"
                    style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      H {item.n_triaj_hemsire} / Ps {item.n_psikiyatrist} / Pg {item.n_psikolog} / Y{" "}
                      {item.n_gozlem_yatagi}
                    </p>
                    <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                      %{formatNumber(item.ayrilma_orani, 1)} ayrilma,{" "}
                      {formatNumber(item.ort_bekleme, 1)} dk bekleme,{" "}
                      {formatNumber(item.gunluk_maliyet)} TL
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div
          className="mt-5 rounded-3xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}
        >
          Kaynak kombinasyonlarini taramak icin optimizasyonu baslatin.
        </div>
      )}
    </section>
  );
}
