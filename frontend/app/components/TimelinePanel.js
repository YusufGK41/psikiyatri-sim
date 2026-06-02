"use client";

import { useState } from "react";
import axios from "axios";
import { Clock3, PlayCircle, Workflow } from "lucide-react";

import { API_URL, buildBasePayload, formatNumber } from "./component-helpers";

const EVENT_META = {
  GELIS: { label: "Gelis", color: "#4f46e5" },
  TRIAJ_BASLADI: { label: "Triyaj basladi", color: "#0ea5e9" },
  TRIAJ_BITTI: { label: "Triyaj bitti", color: "#22c55e" },
  TEDAVI_BASLADI: { label: "Tedavi basladi", color: "#f59e0b" },
  TABURCU: { label: "Taburcu", color: "#10b981" },
  AYRILDI: { label: "Ayrildi", color: "#ef4444" },
};

export default function TimelinePanel({ params, addToast }) {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState(null);

  const runDetailedSimulation = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/simule-et-detayli`, buildBasePayload(params));
      setTimeline(response.data);
      addToast?.("Detayli olay akisi yüklendi.", "success");
    } catch (error) {
      addToast?.(
        error.response?.data?.detail || "Detayli akisa ulasilamadi.",
        "error",
        6000,
      );
    } finally {
      setLoading(false);
    }
  };

  const eventSummary = Object.values(
    (timeline?.olaylar || []).reduce((accumulator, event) => {
      const key = event.olay;
      accumulator[key] = accumulator[key] || {
        key,
        label: EVENT_META[key]?.label || key,
        count: 0,
        color: EVENT_META[key]?.color || "#94a3b8",
      };
      accumulator[key].count += 1;
      return accumulator;
    }, {}),
  );

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Timeline paneli
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Hasta yolculugunu olay seviyesinde izleyin
          </h2>
          <p className="max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Bu panel, simulasyonun olay kayitli versiyonunu yeniden calistirir ve ilk
            200 adimi kronolojik olarak gosterir.
          </p>
        </div>
        <button
          type="button"
          onClick={runDetailedSimulation}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 68%, #0ea5e9))",
          }}
        >
          <PlayCircle size={16} />
          {loading ? "Akis hazirlaniyor..." : "Detayli akisi getir"}
        </button>
      </div>

      {timeline ? (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
            >
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Kayit sayisi
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatNumber(timeline.olaylar?.length || 0)}
              </p>
            </div>
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
            >
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Ortalama bekleme
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {formatNumber(timeline.ozet?.genel_ort_bekleme, 1)} dk
              </p>
            </div>
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
            >
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Ayrilma orani
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                %{formatNumber(timeline.ozet?.ayrilma_orani, 1)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {eventSummary.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border p-3"
                style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {formatNumber(item.count)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border p-4" style={{ borderColor: "var(--card-border)" }}>
            <div className="mb-4 flex items-center gap-2">
              <Workflow size={16} style={{ color: "var(--primary)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Kronolojik olay akisi
              </h3>
            </div>
            <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
              {timeline.olaylar?.map((event, index) => {
                const meta = EVENT_META[event.olay] || EVENT_META.GELIS;

                return (
                  <div key={`${event.hasta_id}-${event.zaman}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className="mt-1 h-3 w-3 rounded-full"
                        style={{ background: meta.color }}
                      />
                      {index < (timeline.olaylar?.length || 0) - 1 ? (
                        <span
                          className="mt-1 h-full w-px"
                          style={{ background: "var(--card-border)" }}
                        />
                      ) : null}
                    </div>
                    <div
                      className="flex-1 rounded-2xl border p-3"
                      style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {meta.label}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: `${meta.color}1a`, color: meta.color }}
                        >
                          {event.oncelik}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Hasta #{event.hasta_id}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <Clock3 size={13} />
                        {formatNumber(event.zaman, 1)}. dakika
                      </div>
                      {event.detay ? (
                        <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                          {event.detay}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="mt-5 rounded-3xl border border-dashed p-8 text-center"
          style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}
        >
          Detayli olay akisini gormek icin paneli calistirin.
        </div>
      )}
    </section>
  );
}
