"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import FullscreenChart from "./FullscreenChart";
import {
  formatNumber,
  getPriorityRows,
  getResourceRows,
  PRIORITY_META,
} from "./component-helpers";

function BaseTooltip({ active, payload, label }) {
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
      {label ? <p className="font-medium">{label}</p> : null}
      {payload.map((entry) => (
        <p key={`${entry.name}-${entry.dataKey}`}>
          {entry.name}:{" "}
          {typeof entry.value === "number" ? formatNumber(entry.value, 1) : entry.value}
          {entry.unit ? ` ${entry.unit}` : ""}
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, description, height = 280, renderChart }) {
  return (
    <article className="card rounded-3xl border p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          ) : null}
        </div>
        <FullscreenChart
          title={title}
          description={description}
          renderContent={() => renderChart({ fullscreen: true })}
        />
      </div>
      <div style={{ height }}>{renderChart({ fullscreen: false })}</div>
    </article>
  );
}

export function BeklemeChart({ data }) {
  const rows = getPriorityRows(data).map((item) => ({
    name: item.label,
    ortalama: item.ortBekleme,
    medyan: item.medyanBekleme,
    color: item.color,
  }));

  return (
    <ChartCard
      title="Bekleme profili"
      description="Oncelik bazinda ortalama ve medyan bekleme suresi."
      renderChart={() => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} barGap={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} unit=" dk" />
            <Tooltip content={<BaseTooltip />} />
            <Legend />
            <Bar dataKey="ortalama" name="Ortalama" fill="#4f46e5" radius={[10, 10, 0, 0]} />
            <Bar dataKey="medyan" name="Medyan" fill="#22c55e" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    />
  );
}

export function DagilimChart({ data }) {
  const rows = getPriorityRows(data);

  return (
    <ChartCard
      title="Hasta dagilimi"
      description="Her oncelik seviyesinde gelen, hizmet alan ve ayrilan hasta sayisi."
      renderChart={() => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
            <XAxis dataKey="label" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
            <Tooltip content={<BaseTooltip />} />
            <Legend />
            <Bar dataKey="gelen" name="Gelen" fill="#60a5fa" radius={[8, 8, 0, 0]} />
            <Bar dataKey="hizmet" name="Hizmet alan" fill="#22c55e" radius={[8, 8, 0, 0]} />
            <Bar dataKey="ayrilan" name="Ayrilan" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    />
  );
}

export function KaynakChart({ data }) {
  const rows = getResourceRows(data);

  return (
    <ChartCard
      title="Kaynak kullanim"
      description="Simulasyon suresince ortalama kullanim yuzdesi."
      renderChart={() => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
            <XAxis
              dataKey="shortLabel"
              stroke="var(--text-muted)"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              tickLine={false}
              axisLine={false}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip content={<BaseTooltip />} />
            <Bar dataKey="value" name="Kullanim" radius={[12, 12, 0, 0]}>
              {rows.map((item) => (
                <Cell key={item.key} fill={item.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    />
  );
}

export function HizmetKarsilastirmaChart({ data }) {
  const rows = getPriorityRows(data);

  return (
    <ChartCard
      title="Hizmet sonucu kompozisyonu"
      description="Oncelik bazinda tamamlanan hizmet ile ayrilan hasta dagilimi."
      renderChart={() => (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<BaseTooltip />} />
            <Legend />
            <Pie
              data={rows}
              dataKey="hizmet"
              nameKey="label"
              name="Hizmet alan"
              cx="36%"
              cy="50%"
              outerRadius={80}
              innerRadius={44}
            >
              {rows.map((row) => (
                <Cell key={`service-${row.key}`} fill={row.color} />
              ))}
            </Pie>
            <Pie
              data={rows}
              dataKey="ayrilan"
              nameKey="label"
              name="Ayrilan"
              cx="74%"
              cy="50%"
              outerRadius={80}
              innerRadius={44}
            >
              {rows.map((row) => (
                <Cell key={`lost-${row.key}`} fill={PRIORITY_META[row.key].softColor} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    />
  );
}

export function SaatlikChart({ data }) {
  const hourlyData = data?.saatlik_gelis || [];

  return (
    <ChartCard
      title="Saatlik hasta akisi"
      description="Gun icindeki talep ritmi ve zirve saatler."
      height={320}
      renderChart={() => (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={hourlyData}>
            <defs>
              <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" />
            <XAxis dataKey="saat" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} />
            <Tooltip content={<BaseTooltip />} />
            <Area
              type="monotone"
              dataKey="hasta"
              name="Saatlik hasta"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#hourlyFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    />
  );
}
