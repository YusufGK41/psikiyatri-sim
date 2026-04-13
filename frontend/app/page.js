"use client";

import { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, Users, UserMinus, Clock } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [sonuclar, setSonuclar] = useState(null);

  // Varsayılan Parametreler
  const [params, setParams] = useState({
    sim_sure: 1440,
    hasta_gelis_ort: 4.0,
    n_triaj_hemsire: 2,
    n_psikiyatrist: 1,
    n_psikolog: 2,
    n_gozlem_yatagi: 4,
  });

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: parseFloat(e.target.value) });
  };

  const simuleEt = async () => {
    setLoading(true);
    try {
      // FastAPI backend'imize istek atıyoruz
      const res = await axios.post(
        "http://localhost:8000/api/simule-et",
        params,
      );
      setSonuclar(res.data);
    } catch (error) {
      console.error("Simülasyon hatası:", error);
      alert("Backend'e bağlanılamadı. 8000 portunda çalıştığından emin ol.");
    }
    setLoading(false);
  };

  // Recharts için verileri formatlıyoruz
  const pieData = sonuclar
    ? [
        {
          name: "P1 (Akut)",
          value: sonuclar.hasta_dagilimi.P1,
          color: "#E24B4A",
        },
        {
          name: "P2 (Orta)",
          value: sonuclar.hasta_dagilimi.P2,
          color: "#EF9F27",
        },
        {
          name: "P3 (Hafif)",
          value: sonuclar.hasta_dagilimi.P3,
          color: "#1D9E75",
        },
      ]
    : [];

  const barData = sonuclar
    ? [
        {
          name: "P1 (Akut)",
          bekleme: sonuclar.oncelik_ort_bekleme.P1,
          fill: "#E24B4A",
        },
        {
          name: "P2 (Orta)",
          bekleme: sonuclar.oncelik_ort_bekleme.P2,
          fill: "#EF9F27",
        },
        {
          name: "P3 (Hafif)",
          bekleme: sonuclar.oncelik_ort_bekleme.P3,
          fill: "#1D9E75",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <Activity className="text-indigo-600 w-8 h-8" />
          <h1 className="text-2xl font-bold text-slate-800">
            Psikiyatri Acil Servisi Karar Destek Sistemi
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sol Panel: Parametre Kontrolleri */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">
              Sistem Parametreleri
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1">
                Ort. Hasta Geliş (dk): {params.hasta_gelis_ort}
              </label>
              <input
                type="range"
                name="hasta_gelis_ort"
                min="1"
                max="20"
                step="0.5"
                value={params.hasta_gelis_ort}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Triyaj Hemşiresi: {params.n_triaj_hemsire}
              </label>
              <input
                type="range"
                name="n_triaj_hemsire"
                min="1"
                max="5"
                value={params.n_triaj_hemsire}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Psikiyatrist: {params.n_psikiyatrist}
              </label>
              <input
                type="range"
                name="n_psikiyatrist"
                min="1"
                max="5"
                value={params.n_psikiyatrist}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Psikolog: {params.n_psikolog}
              </label>
              <input
                type="range"
                name="n_psikolog"
                min="1"
                max="5"
                value={params.n_psikolog}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <button
              onClick={simuleEt}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors mt-6 flex justify-center items-center"
            >
              {loading ? "Hesaplanıyor..." : "Simülasyonu Başlat"}
            </button>
          </div>

          {/* Sağ Panel: Dashboard & Grafikler */}
          <div className="lg:col-span-3 space-y-6">
            {/* Skor Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Toplam Gelen Hasta</p>
                  <p className="text-2xl font-bold">
                    {sonuclar ? sonuclar.ozet.toplam_hasta : "-"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                  <UserMinus size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Bekleyemeyip Ayrılan</p>
                  <p className="text-2xl font-bold">
                    {sonuclar ? sonuclar.ozet.ayrilan_hasta : "-"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Genel Ort. Bekleme</p>
                  <p className="text-2xl font-bold">
                    {sonuclar ? `${sonuclar.ozet.genel_ort_bekleme} dk` : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Grafikler */}
            {sonuclar && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 h-80">
                  <h3 className="font-semibold text-center mb-4">
                    Önceliğe Göre Ortalama Bekleme (Dk)
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip cursor={{ fill: "#f1f5f9" }} />
                      <Bar dataKey="bekleme" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 h-80">
                  <h3 className="font-semibold text-center mb-4">
                    Gelen Hasta Dağılımı
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {!sonuclar && (
              <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400 min-h-[320px]">
                <Activity className="w-16 h-16 mb-4 opacity-20" />
                <p>
                  Verileri görmek için sol panelden parametreleri belirleyip
                  simülasyonu başlatın.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
