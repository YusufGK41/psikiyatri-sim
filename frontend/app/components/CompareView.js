"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatNumber, getScenarioMetrics } from "./component-helpers";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="rounded-xl border px-3 py-2 text-sm shadow-lg"
      style={{
        borderColor: "var(--card-border)",
        background: "var(--tooltip-bg)",
        color: "var(--tooltip-text)",
      }}
    >
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey}>
          {entry.name}: {entry.unit === "dk" ? `${formatNumber(entry.value, 1)} dk` : `%${formatNumber(entry.value, 1)}`}
        </p>
      ))}
    </div>
  );
}

export default function CompareView({ scenarios }) {
  const comparisonData = scenarios.map((scenario, index) =>
    getScenarioMetrics({ ...scenario, index: index + 1 }),
  );

  return (
    <section className="card rounded-3xl border p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
          Senaryo analizi
        </p>
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Calistirmalar arasi fark
        </h2>
        <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
          Bekleme suresi ve ayrilma orani ayni eksende incelenerek hangi senaryonun daha
          dengeli oldugu gorulur.
        </p>
      </div>

      <div className="mt-5 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} barGap={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="var(--text-muted)"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<TooltipContent />} />
            <Bar
              yAxisId="left"
              dataKey="ortBekleme"
              name="Ort. bekleme"
              unit="dk"
              radius={[12, 12, 0, 0]}
              fill="#4f46e5"
            />
            <Bar
              yAxisId="right"
              dataKey="ayrilmaOrani"
              name="Ayrilma orani"
              unit="%"
              radius={[12, 12, 0, 0]}
              fill="#f97316"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
