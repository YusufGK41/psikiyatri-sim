"use client";

import { Play, RefreshCcw } from "lucide-react";

const FIELD_GROUPS = [
  {
    title: "Talep ve zaman",
    fields: [
      {
        key: "sim_sure",
        label: "Simulasyon suresi",
        unit: "dk",
        min: 60,
        max: 10080,
        step: 60,
        hint: "Toplam simulasyon zamanini belirler.",
      },
      {
        key: "hasta_gelis_ort",
        label: "Hasta gelis ortalamasi",
        unit: "dk",
        min: 0.5,
        max: 60,
        step: 0.5,
        hint: "Iki hasta arasindaki ortalama gelis suresi.",
      },
      {
        key: "warmup",
        label: "Warmup",
        unit: "dk",
        min: 0,
        max: 480,
        step: 15,
        hint: "Ilk gecici donemi rapor disinda birakmak icin kullanilir.",
      },
    ],
  },
  {
    title: "Kaynak kapasitesi",
    fields: [
      {
        key: "n_triaj_hemsire",
        label: "Triyaj hemsiresi",
        unit: "kisi",
        min: 1,
        max: 20,
        step: 1,
        hint: "Ilk kabul ve siniflandirma kapasitesi.",
      },
      {
        key: "n_psikiyatrist",
        label: "Psikiyatrist",
        unit: "kisi",
        min: 1,
        max: 20,
        step: 1,
        hint: "Yuksek oncelikli muayene kaynagi.",
      },
      {
        key: "n_psikolog",
        label: "Psikolog",
        unit: "kisi",
        min: 1,
        max: 20,
        step: 1,
        hint: "Danismanlik ve destek hizmet kapasitesi.",
      },
      {
        key: "n_gozlem_yatagi",
        label: "Gozlem yatagi",
        unit: "adet",
        min: 1,
        max: 20,
        step: 1,
        hint: "Gecici izlem kapasitesi.",
      },
    ],
  },
];

const PRESETS = [
  {
    label: "Temel",
    values: {
      sim_sure: 1440,
      hasta_gelis_ort: 4,
      n_triaj_hemsire: 2,
      n_psikiyatrist: 1,
      n_psikolog: 2,
      n_gozlem_yatagi: 4,
      warmup: 0,
    },
  },
  {
    label: "Yogun gun",
    values: {
      sim_sure: 1440,
      hasta_gelis_ort: 2.5,
      n_triaj_hemsire: 2,
      n_psikiyatrist: 1,
      n_psikolog: 2,
      n_gozlem_yatagi: 4,
      warmup: 60,
    },
  },
  {
    label: "Guclendirilmis kadro",
    values: {
      sim_sure: 1440,
      hasta_gelis_ort: 3,
      n_triaj_hemsire: 3,
      n_psikiyatrist: 2,
      n_psikolog: 3,
      n_gozlem_yatagi: 5,
      warmup: 30,
    },
  },
];

export default function ParameterPanel({ params, setParams, onRun, loading }) {
  const updateField = (key, nextValue) => {
    setParams((prev) => ({
      ...prev,
      [key]: key === "hasta_gelis_ort" ? Number(nextValue) : Number(nextValue),
    }));
  };

  return (
    <div className="card rounded-3xl border p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          Senaryo kurulumu
        </p>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Parametre paneli
        </h2>
        <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Akis yogunlugu ve kaynak kapasitesini degistirerek olasi operasyon sonuclarini
          test edin.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setParams(preset.values)}
            className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/5"
            style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {FIELD_GROUPS.map((group) => (
          <section key={group.title} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {group.title}
              </h3>
              <div
                className="h-px flex-1 ml-3"
                style={{ background: "var(--card-border)" }}
              />
            </div>
            <div className="space-y-4">
              {group.fields.map((field) => (
                <label key={field.key} className="block">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {field.label}
                      </span>
                      <p className="text-xs leading-5" style={{ color: "var(--text-muted)" }}>
                        {field.hint}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={params[field.key]}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        className="w-24 rounded-lg border px-2.5 py-2 text-sm shadow-sm outline-none focus:border-[var(--primary)]"
                      />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {field.unit}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    value={params[field.key]}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    onChange={(event) => updateField(field.key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={onRun}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 68%, #22c55e))",
          }}
        >
          <Play size={16} />
          {loading ? "Simulasyon calisiyor..." : "Simulasyonu baslat"}
        </button>
        <button
          type="button"
          onClick={() => setParams(PRESETS[0].values)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors hover:bg-black/5"
          style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
        >
          <RefreshCcw size={16} />
          Parametreleri sifirla
        </button>
      </div>
    </div>
  );
}
