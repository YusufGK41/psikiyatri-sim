"use client";

import { Trash2 } from "lucide-react";

import { formatNumber, getScenarioMetrics } from "./component-helpers";

export default function ScenarioCompare({ scenarios, onRemove }) {
  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Senaryo kutugu
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Karsilastirma secimi
          </h2>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{
            background: "color-mix(in srgb, var(--primary) 14%, transparent)",
            color: "var(--primary)",
          }}
        >
          {scenarios.length} kayitli calistirma
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {scenarios.map((scenario, index) => {
          const metrics = getScenarioMetrics({ ...scenario, index: index + 1 });

          return (
            <article
              key={scenario.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--card-border)",
                background: "color-mix(in srgb, var(--card) 96%, transparent)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {metrics.name}
                  </h3>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Hasta gelis ort. {scenario.params.hasta_gelis_ort} dk
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(scenario.id)}
                  className="rounded-lg p-2 transition-colors hover:bg-black/5"
                  aria-label={`${metrics.name} senaryosunu sil`}
                  style={{ color: "var(--text-muted)" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt style={{ color: "var(--text-muted)" }}>Ort. bekleme</dt>
                  <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {formatNumber(metrics.ortBekleme, 1)} dk
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "var(--text-muted)" }}>Ayrilma</dt>
                  <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
                    %{formatNumber(metrics.ayrilmaOrani, 1)}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "var(--text-muted)" }}>Toplam hasta</dt>
                  <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {formatNumber(metrics.toplamHasta)}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "var(--text-muted)" }}>Hizmet alan</dt>
                  <dd className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {formatNumber(metrics.hizmetAlan)}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
