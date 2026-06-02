"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "psikiyatri-sim-onboarding-seen";

const STEPS = [
  {
    title: "1. Senaryoyu kurun",
    body: "Sol panelden simulasyon suresi, hasta gelis hizi ve ekip kapasitesini ayarlayin.",
  },
  {
    title: "2. Sonuclari karsilastirin",
    body: "Dashboard kartlari, grafikler ve senaryo karsilastirma bolumu etkileri hizla gosterir.",
  },
  {
    title: "3. Analize derinlesin",
    body: "Monte Carlo, duyarlilik ve optimizasyon panelleri planlama kararlarini destekler.",
  },
];

export default function Onboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      try {
        const seen = localStorage.getItem(STORAGE_KEY);
        if (!seen) {
          setOpen(true);
        }
      } catch {
        setOpen(true);
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage write issues and still allow the user to continue.
    }
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
    >
      <div
        className="card relative w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl animate-fade-in"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--card) 96%, white), color-mix(in srgb, var(--primary) 8%, var(--card)))",
        }}
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-black/5"
          aria-label="Onboarding penceresini kapat"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={16} />
        </button>

        <div className="grid gap-6 px-6 py-7 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-9">
          <div className="space-y-5">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "color-mix(in srgb, var(--primary) 14%, transparent)",
                color: "var(--primary)",
              }}
            >
              <Sparkles size={14} />
              Karar destek paneline hos geldiniz
            </div>
            <div className="space-y-3">
              <h2
                className="text-2xl font-semibold tracking-tight md:text-3xl"
                style={{ color: "var(--text-primary)" }}
              >
                Psikiyatri acil servisinde kapasite kararlarini gorunur hale getirin.
              </h2>
              <p className="max-w-xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                Bu arayuz, simulasyon ciktisini yalnizca rakam olarak degil, karar aninda
                yorumlanabilir bir operasyon panosu olarak sunar.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, #ec4899))",
              }}
            >
              Panele gec
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid gap-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "color-mix(in srgb, var(--card-border) 80%, var(--primary))",
                  background: "color-mix(in srgb, var(--card) 86%, transparent)",
                }}
              >
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
