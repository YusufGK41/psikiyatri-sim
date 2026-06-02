"use client";

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  Activity,
  Users,
  UserMinus,
  Clock,
  HeartPulse,
  Percent,
  Timer,
  Download,
  History,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";

import StatCard from "./components/StatCard";
import ParameterPanel from "./components/ParameterPanel";
import {
  BeklemeChart,
  DagilimChart,
  SaatlikChart,
  KaynakChart,
  HizmetKarsilastirmaChart,
} from "./components/ChartSection";
import ScenarioCompare from "./components/ScenarioCompare";
import CompareView from "./components/CompareView";
import { ToastContainer } from "./components/Toast";
import TabNav from "./components/TabNav";
import MonteCarloPanel from "./components/MonteCarloPanel";
import SensitivityPanel from "./components/SensitivityPanel";
import OptimizationPanel from "./components/OptimizationPanel";
import MethodologySection from "./components/MethodologySection";
import PdfExport from "./components/PdfExport";
import DarkModeToggle from "./components/DarkModeToggle";
import InsightPanel from "./components/InsightPanel";
import TimelinePanel from "./components/TimelinePanel";
import HeatmapPanel from "./components/HeatmapPanel";
import Onboarding from "./components/Onboarding";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DEFAULT_PARAMS = {
  sim_sure: 1440,
  hasta_gelis_ort: 4.0,
  n_triaj_hemsire: 2,
  n_psikiyatrist: 1,
  n_psikolog: 2,
  n_gozlem_yatagi: 4,
  warmup: 0,
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [sonuclar, setSonuclar] = useState(null);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [scenarios, setScenarios] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dashboardRef = useRef(null);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const simuleEt = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/simule-et`, params);
      setSonuclar(res.data);
      setRunCount((prev) => prev + 1);

      setScenarios((prev) => [
        ...prev,
        { id: Date.now(), params: { ...params }, data: res.data },
      ]);

      addToast(
        `Simülasyon tamamlandı — ${res.data.ozet.toplam_hasta} hasta işlendi`,
        "success",
      );
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        "Backend'e bağlanılamadı. Sunucunun çalıştığından emin olun.";
      addToast(detail, "error", 6000);
    }
    setLoading(false);
  };

  const removeScenario = (id) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const exportCSV = () => {
    if (!sonuclar) return;

    const rows = [
      ["Metrik", "Değer"],
      ["Toplam Hasta", sonuclar.ozet.toplam_hasta],
      ["Hizmet Alan Hasta", sonuclar.ozet.hizmet_alan_hasta],
      ["Ayrılan Hasta", sonuclar.ozet.ayrilan_hasta],
      ["Ayrılma Oranı (%)", sonuclar.ozet.ayrilma_orani],
      ["Genel Ort. Bekleme (dk)", sonuclar.ozet.genel_ort_bekleme],
      ["Genel Medyan Bekleme (dk)", sonuclar.ozet.genel_medyan_bekleme],
      ["Ort. Triaj Bekleme (dk)", sonuclar.ozet.ort_triaj_bekleme],
      [],
      [
        "Öncelik",
        "Gelen",
        "Hizmet Alan",
        "Ayrılan",
        "Ort. Bekleme",
        "Medyan Bekleme",
      ],
      ...["P1", "P2", "P3"].map((p) => [
        p,
        sonuclar.hasta_dagilimi[p],
        sonuclar.hizmet_alinan[p],
        sonuclar.ayrilanlar_oncelik[p],
        sonuclar.oncelik_ort_bekleme[p],
        sonuclar.oncelik_medyan_bekleme[p],
      ]),
      [],
      ["Kaynak", "Kullanım (%)"],
      ["Triyaj Hemşiresi", sonuclar.kaynak_kullanim.triaj_hemsire],
      ["Psikiyatrist", sonuclar.kaynak_kullanim.psikiyatrist],
      ["Psikolog", sonuclar.kaynak_kullanim.psikolog],
      ["Gözlem Yatağı", sonuclar.kaynak_kullanim.gozlem_yatagi],
      [],
      ["Saat", "Hasta Sayısı"],
      ...sonuclar.saatlik_gelis.map((s) => [s.saat, s.hasta]),
    ];

    const bom = "\uFEFF";
    const csv = bom + rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `simulasyon-sonuc-${new Date().toISOString().slice(0, 16)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("CSV dosyası indirildi", "success");
  };

  return (
    <div
      className="min-h-screen p-4 md:p-6"
      style={{ background: "var(--background)" }}
    >
      <Onboarding />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <header
          className="card rounded-xl shadow-sm border px-5 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{
            borderBottom: "2px solid transparent",
            borderImage:
              "linear-gradient(90deg, var(--primary), #ec4899, #f59e0b) 1",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <h1
                className="text-lg md:text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Psikiyatri Acil Servisi
              </h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Karar Destek Simülasyon Sistemi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            {sonuclar && (
              <PdfExport dashboardRef={dashboardRef} addToast={addToast} />
            )}
            {sonuclar && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 text-xs font-medium border px-3 py-2 rounded-lg transition-colors"
                style={{
                  color: "var(--text-secondary)",
                  borderColor: "var(--card-border)",
                  background: "var(--card)",
                }}
              >
                <Download size={14} />
                <span className="hidden sm:inline">CSV İndir</span>
              </button>
            )}
            {runCount > 0 && (
              <div
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--card-border)",
                  background: "var(--card)",
                }}
              >
                <History size={13} />
                {runCount} çalıştırma
              </div>
            )}
          </div>
        </header>

        {/* Tab Navigation */}
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sol Panel -- mobilde collapsible sidebar */}
          <aside
            className={`lg:col-span-3 ${sidebarOpen ? "block" : "hidden lg:block"}`}
          >
            <div className="lg:sticky lg:top-6">
              <ParameterPanel
                params={params}
                setParams={setParams}
                onRun={simuleEt}
                loading={loading}
              />
            </div>
          </aside>

          {/* Ana İçerik */}
          <main className="lg:col-span-9 space-y-5">
            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div ref={dashboardRef} className="space-y-5">
                {sonuclar && <InsightPanel data={sonuclar} />}

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  <StatCard
                    icon={Users}
                    label="Toplam Hasta"
                    value={sonuclar ? sonuclar.ozet.toplam_hasta : "-"}
                    color="blue"
                    loading={loading}
                  />
                  <StatCard
                    icon={HeartPulse}
                    label="Hizmet Alan"
                    value={sonuclar ? sonuclar.ozet.hizmet_alan_hasta : "-"}
                    color="emerald"
                    loading={loading}
                  />
                  <StatCard
                    icon={UserMinus}
                    label="Ayrılan"
                    value={sonuclar ? sonuclar.ozet.ayrilan_hasta : "-"}
                    color="red"
                    loading={loading}
                  />
                  <StatCard
                    icon={Percent}
                    label="Ayrılma Oranı"
                    value={sonuclar ? `%${sonuclar.ozet.ayrilma_orani}` : "-"}
                    color="amber"
                    loading={loading}
                  />
                  <StatCard
                    icon={Clock}
                    label="Ort. Bekleme"
                    value={
                      sonuclar ? `${sonuclar.ozet.genel_ort_bekleme} dk` : "-"
                    }
                    sub={
                      sonuclar
                        ? `Medyan: ${sonuclar.ozet.genel_medyan_bekleme} dk`
                        : undefined
                    }
                    color="indigo"
                    loading={loading}
                  />
                  <StatCard
                    icon={Timer}
                    label="Triaj Bekleme"
                    value={
                      sonuclar ? `${sonuclar.ozet.ort_triaj_bekleme} dk` : "-"
                    }
                    color="purple"
                    loading={loading}
                  />
                </div>

                {sonuclar ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <BeklemeChart data={sonuclar} />
                      <DagilimChart data={sonuclar} />
                      <KaynakChart data={sonuclar} />
                      <HizmetKarsilastirmaChart data={sonuclar} />
                      <SaatlikChart data={sonuclar} />
                    </div>
                    <TimelinePanel params={params} addToast={addToast} />
                  </>
                ) : (
                  <div
                    className="card rounded-xl shadow-sm border flex flex-col items-center justify-center min-h-[360px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {loading ? (
                      <div className="space-y-4 text-center">
                        <div className="flex gap-1.5 justify-center">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: "var(--primary)",
                              animation: "pulse-dot 1.2s infinite 0s",
                            }}
                          />
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: "var(--primary)",
                              animation: "pulse-dot 1.2s infinite 0.2s",
                            }}
                          />
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background: "var(--primary)",
                              animation: "pulse-dot 1.2s infinite 0.4s",
                            }}
                          />
                        </div>
                        <p className="text-sm">Simülasyon hesaplanıyor...</p>
                      </div>
                    ) : (
                      <>
                        <Activity className="w-14 h-14 mb-3 opacity-15" />
                        <p className="text-sm font-medium mb-1">
                          Henüz veri yok
                        </p>
                        <p
                          className="text-xs max-w-xs text-center"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Sol panelden parametreleri ayarlayıp simülasyonu
                          başlatın
                        </p>
                      </>
                    )}
                  </div>
                )}

                {scenarios.length > 1 && (
                  <>
                    <ScenarioCompare
                      scenarios={scenarios}
                      onRemove={removeScenario}
                      currentData={sonuclar}
                    />
                    <CompareView scenarios={scenarios} />
                  </>
                )}
              </div>
            )}

            {/* ANALİZ */}
            {activeTab === "analiz" && (
              <div className="space-y-8">
                <MonteCarloPanel params={params} addToast={addToast} />
                <div
                  className="border-t pt-8"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <SensitivityPanel params={params} addToast={addToast} />
                </div>
                <div
                  className="border-t pt-8"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <HeatmapPanel params={params} addToast={addToast} />
                </div>
              </div>
            )}

            {/* OPTİMİZASYON */}
            {activeTab === "optimizasyon" && (
              <OptimizationPanel params={params} addToast={addToast} />
            )}

            {/* METODOLOJİ */}
            {activeTab === "metodoloji" && (
              <MethodologySection data={sonuclar} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
