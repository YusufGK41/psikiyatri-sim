"use client";

import { FileSearch, ShieldCheck, Workflow } from "lucide-react";

import FindingsSection from "./FindingsSection";
import FlowDiagram from "./FlowDiagram";
import ValidationTable from "./ValidationTable";

export default function MethodologySection({ data }) {
  return (
    <div className="space-y-5">
      <section className="card rounded-3xl border p-5 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Metodoloji
          </p>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Model mantigi, kontrol adimlari ve yorumlar ayni yerde
          </h2>
          <p className="max-w-3xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            Bu bolum, simulasyon akisini yalnizca sonuctan ibaret gormek yerine modelleme,
            validasyon ve karar yorumlarini birlikte okumayi kolaylastirir.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Workflow,
              title: "Akis temelli model",
              body: "Hasta gelisi, triyaj, klinik degerlendirme ve cikis adimlari kaynak kisitlariyla modellenir.",
            },
            {
              icon: ShieldCheck,
              title: "Hizli dogrulama",
              body: "Ayrilma orani, triage bekleme ve kaynak dengesi gibi temel kontroller tablo uzerinden izlenir.",
            },
            {
              icon: FileSearch,
              title: "Karara donusen bulgu",
              body: "Veri icindeki darbogazlar ve zirve saatler, yonetsel yorum satirlarina cevrilir.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--card-border)",
                  background: "color-mix(in srgb, var(--card) 95%, transparent)",
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
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <FlowDiagram data={data} />
      <ValidationTable data={data} />
      <FindingsSection data={data} />
    </div>
  );
}
