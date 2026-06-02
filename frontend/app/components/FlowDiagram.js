"use client";

import { ArrowRight, BedDouble, ClipboardPlus, ScanSearch, Stethoscope, UserRoundX } from "lucide-react";

import { formatNumber } from "./component-helpers";

const STEPS = [
  {
    key: "arrival",
    title: "Hasta gelisi",
    icon: ClipboardPlus,
    body: "Sisteme giris ve kuyruk olusumu.",
  },
  {
    key: "triage",
    title: "Triyaj",
    icon: ScanSearch,
    body: "P1, P2, P3 oncelik siniflandirmasi.",
  },
  {
    key: "treatment",
    title: "Klinik degerlendirme",
    icon: Stethoscope,
    body: "Psikiyatrist veya psikolog atamasi.",
  },
  {
    key: "observation",
    title: "Gozlem alani",
    icon: BedDouble,
    body: "Gereken hastalar icin izlem kapasitesi.",
  },
  {
    key: "exit",
    title: "Taburcu veya ayrilma",
    icon: UserRoundX,
    body: "Surec tamamlanir veya hasta sistemi terk eder.",
  },
];

export default function FlowDiagram({ data }) {
  const summary = data?.ozet;

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          Akis diyagrami
        </p>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Sistem mantigi tek bakista
        </h2>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.key} className="contents">
              <article
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--card-border)",
                  background: "color-mix(in srgb, var(--card) 96%, transparent)",
                }}
              >
                <div
                  className="inline-flex rounded-2xl p-2.5"
                  style={{
                    background: "color-mix(in srgb, var(--primary) 14%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3 className="mt-3 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {step.body}
                </p>
                {step.key === "arrival" && summary ? (
                  <p className="mt-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Toplam {formatNumber(summary.toplam_hasta)} hasta
                  </p>
                ) : null}
                {step.key === "exit" && summary ? (
                  <p className="mt-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Ayrilma %{formatNumber(summary.ayrilma_orani, 1)}
                  </p>
                ) : null}
              </article>
              {index < STEPS.length - 1 ? (
                <div className="hidden items-center justify-center xl:flex">
                  <ArrowRight size={18} style={{ color: "var(--text-muted)" }} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
