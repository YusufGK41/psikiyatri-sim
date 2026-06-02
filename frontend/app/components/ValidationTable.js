"use client";

import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

import { getValidationRows } from "./component-helpers";

const STATUS_META = {
  pass: {
    label: "Gecerli",
    icon: CheckCircle2,
    color: "#10b981",
  },
  warn: {
    label: "Izlenmeli",
    icon: AlertCircle,
    color: "#f59e0b",
  },
  fail: {
    label: "Riskli",
    icon: AlertCircle,
    color: "#ef4444",
  },
  pending: {
    label: "Beklemede",
    icon: Clock3,
    color: "#94a3b8",
  },
};

export default function ValidationTable({ data }) {
  const rows = getValidationRows(data);

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          Validation table
        </p>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Sonuclar hizli kontrol listesi
        </h2>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--card-border)" }}>
        <table className="min-w-full divide-y" style={{ borderColor: "var(--card-border)" }}>
          <thead style={{ background: "color-mix(in srgb, var(--card) 82%, transparent)" }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Kontrol
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Gerceklesen
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Hedef
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                Durum
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--card-border)" }}>
            {rows.map((row) => {
              const meta = STATUS_META[row.status] || STATUS_META.pending;
              const Icon = meta.icon;

              return (
                <tr key={row.label} style={{ background: "var(--card)" }}>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {row.label}
                    </p>
                    <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                      {row.detail}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                    {row.actual}
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                    {row.target}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: `${meta.color}1a`, color: meta.color }}
                    >
                      <Icon size={13} />
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
