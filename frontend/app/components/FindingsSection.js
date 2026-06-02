"use client";

import { Lightbulb, Siren, Target } from "lucide-react";

import { getFindings } from "./component-helpers";

const TONE_META = {
  info: {
    icon: Lightbulb,
    color: "#4f46e5",
  },
  warn: {
    icon: Siren,
    color: "#f59e0b",
  },
  success: {
    icon: Target,
    color: "#10b981",
  },
};

export default function FindingsSection({ data }) {
  const findings = getFindings(data);

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          Bulgular bolumu
        </p>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Yonetim icin one cikan mesajlar
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {findings.map((finding) => {
          const meta = TONE_META[finding.tone] || TONE_META.info;
          const Icon = meta.icon;

          return (
            <article
              key={finding.title}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--card-border)",
                background: "color-mix(in srgb, var(--card) 95%, transparent)",
              }}
            >
              <div
                className="inline-flex rounded-2xl p-2.5"
                style={{ background: `${meta.color}1a`, color: meta.color }}
              >
                <Icon size={18} />
              </div>
              <h3 className="mt-3 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {finding.title}
              </h3>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {finding.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
