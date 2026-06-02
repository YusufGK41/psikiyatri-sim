"use client";

import { TrendingUp } from "lucide-react";

import AnimatedNumber from "./AnimatedNumber";

const COLOR_META = {
  blue: {
    accent: "#3b82f6",
    surface: "rgba(59, 130, 246, 0.12)",
  },
  emerald: {
    accent: "#10b981",
    surface: "rgba(16, 185, 129, 0.12)",
  },
  red: {
    accent: "#ef4444",
    surface: "rgba(239, 68, 68, 0.12)",
  },
  amber: {
    accent: "#f59e0b",
    surface: "rgba(245, 158, 11, 0.12)",
  },
  indigo: {
    accent: "#6366f1",
    surface: "rgba(99, 102, 241, 0.12)",
  },
  purple: {
    accent: "#8b5cf6",
    surface: "rgba(139, 92, 246, 0.12)",
  },
};

function parseDisplayValue(value) {
  if (typeof value === "number") {
    return { numeric: value, decimals: Number.isInteger(value) ? 0 : 1 };
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^([^0-9-]*)(-?\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) {
    return null;
  }

  return {
    prefix: match[1],
    numeric: Number(match[2].replace(",", ".")),
    suffix: match[3],
    decimals: match[2].includes(".") || match[2].includes(",") ? 1 : 0,
  };
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "blue",
  loading = false,
}) {
  const meta = COLOR_META[color] || COLOR_META.blue;
  const animatedValue = parseDisplayValue(value);

  return (
    <div
      className="card rounded-2xl border p-4 shadow-sm"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--card) 98%, white), var(--card))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
          <div className="mt-3 min-h-[2rem]">
            {loading ? (
              <div className="skeleton h-8 w-28" />
            ) : animatedValue ? (
              <AnimatedNumber
                value={animatedValue.numeric}
                decimals={animatedValue.decimals}
                prefix={animatedValue.prefix}
                suffix={animatedValue.suffix}
                className="text-2xl font-semibold tracking-tight"
              />
            ) : (
              <p className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {String(value ?? "-")}
              </p>
            )}
          </div>
        </div>
        <div
          className="rounded-2xl p-2.5"
          style={{ background: meta.surface, color: meta.accent }}
        >
          {Icon ? <Icon size={18} /> : <TrendingUp size={18} />}
        </div>
      </div>
      {sub ? (
        <p className="mt-3 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}
