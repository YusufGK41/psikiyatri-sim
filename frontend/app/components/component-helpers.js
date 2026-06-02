export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const PRIORITY_META = {
  P1: {
    label: "P1",
    title: "Akut",
    color: "#ef4444",
    softColor: "rgba(239, 68, 68, 0.16)",
  },
  P2: {
    label: "P2",
    title: "Orta",
    color: "#f59e0b",
    softColor: "rgba(245, 158, 11, 0.16)",
  },
  P3: {
    label: "P3",
    title: "Hafif",
    color: "#10b981",
    softColor: "rgba(16, 185, 129, 0.16)",
  },
};

export const RESOURCE_META = {
  triaj_hemsire: {
    label: "Triyaj Hemsiresi",
    shortLabel: "Triyaj",
    color: "#4f46e5",
  },
  psikiyatrist: {
    label: "Psikiyatrist",
    shortLabel: "Psikiyatrist",
    color: "#ec4899",
  },
  psikolog: {
    label: "Psikolog",
    shortLabel: "Psikolog",
    color: "#0ea5e9",
  },
  gozlem_yatagi: {
    label: "Gozlem Yatagi",
    shortLabel: "Yatak",
    color: "#22c55e",
  },
};

export const VARIABLE_META = {
  n_triaj_hemsire: {
    label: "Triyaj hemsiresi",
    shortLabel: "Hemsire",
    min: 1,
    max: 6,
    step: 1,
  },
  n_psikiyatrist: {
    label: "Psikiyatrist",
    shortLabel: "Psikiyatrist",
    min: 1,
    max: 5,
    step: 1,
  },
  n_psikolog: {
    label: "Psikolog",
    shortLabel: "Psikolog",
    min: 1,
    max: 6,
    step: 1,
  },
  n_gozlem_yatagi: {
    label: "Gozlem yatagi",
    shortLabel: "Yatak",
    min: 1,
    max: 8,
    step: 1,
  },
};

export const TAB_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analiz", label: "Analiz" },
  { id: "optimizasyon", label: "Optimizasyon" },
  { id: "metodoloji", label: "Metodoloji" },
];

export function joinClasses(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function buildBasePayload(params) {
  return {
    sim_sure: Number(params.sim_sure),
    hasta_gelis_ort: Number(params.hasta_gelis_ort),
    n_triaj_hemsire: Number(params.n_triaj_hemsire),
    n_psikiyatrist: Number(params.n_psikiyatrist),
    n_psikolog: Number(params.n_psikolog),
    n_gozlem_yatagi: Number(params.n_gozlem_yatagi),
    warmup: Number(params.warmup || 0),
  };
}

export function formatNumber(value, digits = 0) {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(numericValue);
}

export function getPriorityRows(data) {
  return Object.entries(PRIORITY_META).map(([key, meta]) => ({
    key,
    label: `${meta.label} / ${meta.title}`,
    color: meta.color,
    gelen: data?.hasta_dagilimi?.[key] ?? 0,
    hizmet: data?.hizmet_alinan?.[key] ?? 0,
    ayrilan: data?.ayrilanlar_oncelik?.[key] ?? 0,
    ortBekleme: data?.oncelik_ort_bekleme?.[key] ?? 0,
    medyanBekleme: data?.oncelik_medyan_bekleme?.[key] ?? 0,
  }));
}

export function getResourceRows(data) {
  return Object.entries(RESOURCE_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    shortLabel: meta.shortLabel,
    color: meta.color,
    value: data?.kaynak_kullanim?.[key] ?? 0,
  }));
}

export function getPeakHour(hourlyData = []) {
  return hourlyData.reduce(
    (best, item) => {
      if ((item?.hasta ?? 0) > (best?.hasta ?? -1)) {
        return item;
      }

      return best;
    },
    { saat: "--", hasta: 0 },
  );
}

export function getBottleneckResource(data) {
  return getResourceRows(data).reduce(
    (best, item) => {
      if ((item?.value ?? 0) > (best?.value ?? -1)) {
        return item;
      }

      return best;
    },
    { label: "--", value: 0, color: "#94a3b8" },
  );
}

export function getFastestPriority(data) {
  return getPriorityRows(data).reduce(
    (best, item) => {
      if ((item?.ortBekleme ?? Number.POSITIVE_INFINITY) < best.ortBekleme) {
        return item;
      }

      return best;
    },
    {
      label: "--",
      ortBekleme: Number.POSITIVE_INFINITY,
      color: "#94a3b8",
    },
  );
}

export function getScenarioMetrics(scenario) {
  const summary = scenario?.data?.ozet;

  if (!summary) {
    return {
      name: "Senaryo",
      ortBekleme: 0,
      ayrilmaOrani: 0,
      toplamHasta: 0,
      hizmetAlan: 0,
    };
  }

  return {
    name: `Senaryo ${scenario.index}`,
    ortBekleme: summary.genel_ort_bekleme ?? 0,
    ayrilmaOrani: summary.ayrilma_orani ?? 0,
    toplamHasta: summary.toplam_hasta ?? 0,
    hizmetAlan: summary.hizmet_alan_hasta ?? 0,
  };
}

export function getValidationRows(data) {
  if (!data) {
    return [
      {
        label: "Simulasyon sonucu bekleniyor",
        actual: "-",
        target: "Sonuc gerekli",
        status: "pending",
        detail: "Bu tablo, simulasyon kosulduktan sonra otomatik dolar.",
      },
    ];
  }

  const abandonment = Number(data?.ozet?.ayrilma_orani ?? 0);
  const triageWait = Number(data?.ozet?.ort_triaj_bekleme ?? 0);
  const resourceAverage =
    getResourceRows(data).reduce((sum, item) => sum + item.value, 0) / 4;
  const priorityRows = getPriorityRows(data);
  const isPriorityOrdered =
    (priorityRows[0]?.ortBekleme ?? 0) <= (priorityRows[1]?.ortBekleme ?? 0) &&
    (priorityRows[1]?.ortBekleme ?? 0) <= (priorityRows[2]?.ortBekleme ?? 0);

  return [
    {
      label: "Ayrilma orani",
      actual: `%${formatNumber(abandonment, 1)}`,
      target: "<= %8",
      status: abandonment <= 8 ? "pass" : abandonment <= 12 ? "warn" : "fail",
      detail:
        abandonment <= 8
          ? "Hastalarin buyuk kismi sistemde tutuluyor."
          : "Kaynaklari veya akisi iyilestirmek faydali olabilir.",
    },
    {
      label: "Triyaj bekleme",
      actual: `${formatNumber(triageWait, 1)} dk`,
      target: "<= 12 dk",
      status: triageWait <= 12 ? "pass" : triageWait <= 18 ? "warn" : "fail",
      detail:
        triageWait <= 12
          ? "Ilk temas hizi kabul edilebilir seviyede."
          : "Ilk karsilama darbogazi olusuyor olabilir.",
    },
    {
      label: "Kaynak dengesi",
      actual: `%${formatNumber(resourceAverage, 1)}`,
      target: "%55 - %85",
      status:
        resourceAverage >= 55 && resourceAverage <= 85
          ? "pass"
          : resourceAverage >= 45 && resourceAverage <= 92
            ? "warn"
            : "fail",
      detail:
        resourceAverage >= 55 && resourceAverage <= 85
          ? "Kaynaklar verimli ve asiri yuklenmeden calisiyor."
          : "Fazla atil kapasite veya asiri yuklenme sinyali var.",
    },
    {
      label: "Oncelik akisi",
      actual: isPriorityOrdered ? "Tutarlı" : "Sapma var",
      target: "P1 <= P2 <= P3",
      status: isPriorityOrdered ? "pass" : "warn",
      detail:
        isPriorityOrdered
          ? "Daha kritik vakalar daha hizli hizmet aliyor."
          : "Bekleme hiyerarsisini gozden gecirmek gerekebilir.",
    },
  ];
}

export function getFindings(data) {
  if (!data) {
    return [
      {
        title: "Canli bulgu paneli",
        tone: "info",
        body: "Simulasyon kosuldugunda bu alan veriden otomatik yorumlar uretir.",
      },
      {
        title: "Darbogaz takibi",
        tone: "warn",
        body: "Kaynak kullanim yuzdeleri ve triyaj akisi burada ozetlenir.",
      },
      {
        title: "Planlama destegi",
        tone: "success",
        body: "Panel, hangi ekipman veya kadro artisinin daha etkili oldugunu vurgular.",
      },
    ];
  }

  const peakHour = getPeakHour(data?.saatlik_gelis || []);
  const bottleneck = getBottleneckResource(data);
  const fastest = getFastestPriority(data);
  const abandonment = Number(data?.ozet?.ayrilma_orani ?? 0);

  return [
    {
      title: "Yogun saat penceresi",
      tone: "info",
      body: `${peakHour.saat} civarinda saatlik hasta sayisi ${formatNumber(peakHour.hasta)} ile tepeye ulasiyor.`,
    },
    {
      title: "Ana darboğaz",
      tone: bottleneck.value >= 85 ? "warn" : "success",
      body: `${bottleneck.label} kullanim seviyesi %${formatNumber(bottleneck.value, 1)}. Bu kaynak akisin ritmini belirliyor.`,
    },
    {
      title: "Oncelik performansi",
      tone: abandonment > 10 ? "warn" : "success",
      body:
        abandonment > 10
          ? `Ayrilma orani %${formatNumber(abandonment, 1)} seviyesinde. ${fastest.label} akisi guclu olsa da genel sistem baski altinda.`
          : `${fastest.label} grubu ortalama ${formatNumber(fastest.ortBekleme, 1)} dakika ile en hizli hizmeti aliyor.`,
    },
  ];
}

export function getHeatColor(value, maxValue = 20) {
  const safeValue = Number(value ?? 0);
  const ratio = Math.max(0, Math.min(1, safeValue / Math.max(maxValue, 1)));
  const hue = 160 - ratio * 140;
  const saturation = 82;
  const lightness = 48 - ratio * 10;

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}
