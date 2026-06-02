"use client";

import { ActivitySquare, AlertTriangle, Gauge, TrendingUp } from "lucide-react";

import AnimatedNumber from "./AnimatedNumber";
import {
  formatNumber,
  getBottleneckResource,
  getFastestPriority,
  getPeakHour,
} from "./component-helpers";

export default function InsightPanel({ data }) {
  const peakHour = getPeakHour(data?.saatlik_gelis || []);
  const bottleneck = getBottleneckResource(data);
  const fastest = getFastestPriority(data);
  const abandonment = Number(data?.ozet?.ayrilma_orani ?? 0);

  const cards = [
    {
      icon: TrendingUp,
      title: "Yukte zirve",
      value: peakHour.hasta,
      suffix: " hasta/saat",
      description: `${peakHour.saat} saatinde talep tepeye ulasiyor.`,
      accent: "#4f46e5",
    },
    {
      icon: Gauge,
      title: "Darbogaz",
      value: bottleneck.value,
      suffix: "%",
      description: `${bottleneck.label} en yuksek kullanim seviyesinde.`,
      accent: bottleneck.color,
    },
    {
      icon: ActivitySquare,
      title: "En hizli akis",
      value: fastest.ortBekleme,
      suffix: " dk",
      description: `${fastest.label} grubu en hizli hizmete ulasiyor.`,
      accent: fastest.color,
    },
    {
      icon: AlertTriangle,
      title: "Terk riski",
      value: abandonment,
      suffix: "%",
      description:
        abandonment > 10
          ? "Ayrilma orani yuksek; kaynak planini yeniden dengelemek gerekebilir."
          : "Ayrilma orani kontrol altinda gorunuyor.",
      accent: abandonment > 10 ? "#ef4444" : "#10b981",
    },
  ];

  return (
    <section
      className="card overflow-hidden rounded-3xl border p-5 shadow-sm"
      style={{
        background:
          "linear-gradient(140deg, color-mix(in srgb, var(--card) 94%, white), color-mix(in srgb, var(--primary) 6%, var(--card)))",
      }}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Operasyon icgorusu
          </p>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Bu calistirmada sistemin ritmi nerede sekilleniyor?
          </h2>
          <p className="max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Ortalama bekleme {formatNumber(data?.ozet?.genel_ort_bekleme, 1)} dakika.
            Triage gecikmesi {formatNumber(data?.ozet?.ort_triaj_bekleme, 1)} dakika ve
            en yogun nokta {peakHour.saat}.
          </p>
        </div>
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--primary) 14%, transparent)",
            color: "var(--primary)",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.16em]">Hizmet alan hasta</p>
          <AnimatedNumber
            value={data?.ozet?.hizmet_alan_hasta ?? 0}
            className="mt-2 block text-2xl font-semibold tracking-tight"
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--card-border)",
                background: "color-mix(in srgb, var(--card) 94%, transparent)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    {card.title}
                  </p>
                  <AnimatedNumber
                    value={card.value}
                    decimals={1}
                    suffix={card.suffix}
                    className="mt-2 block text-2xl font-semibold tracking-tight"
                  />
                </div>
                <div
                  className="rounded-2xl p-2.5"
                  style={{ background: `${card.accent}1a`, color: card.accent }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {card.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
