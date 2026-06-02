"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { joinClasses } from "./component-helpers";

const TOAST_META = {
  success: {
    icon: CheckCircle2,
    border: "rgba(16, 185, 129, 0.35)",
    accent: "#10b981",
  },
  error: {
    icon: AlertCircle,
    border: "rgba(239, 68, 68, 0.35)",
    accent: "#ef4444",
  },
  info: {
    icon: Info,
    border: "rgba(79, 70, 229, 0.35)",
    accent: "#4f46e5",
  },
};

function ToastItem({ toast, removeToast }) {
  const [closing, setClosing] = useState(false);
  const meta = TOAST_META[toast.type] || TOAST_META.info;
  const Icon = meta.icon;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setClosing(true);
      window.setTimeout(() => removeToast(toast.id), 280);
    }, toast.duration || 4000);

    return () => window.clearTimeout(timeout);
  }, [toast.duration, toast.id, removeToast]);

  const handleClose = () => {
    setClosing(true);
    window.setTimeout(() => removeToast(toast.id), 280);
  };

  return (
    <div
      className={joinClasses(
        "relative overflow-hidden rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
        closing ? "animate-slide-out" : "animate-slide-in",
      )}
      style={{
        background: "color-mix(in srgb, var(--card) 92%, transparent)",
        borderColor: meta.border,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 rounded-full p-1.5"
          style={{ background: `${meta.accent}1a`, color: meta.accent }}
        >
          <Icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-md p-1 transition-colors hover:bg-black/5"
          style={{ color: "var(--text-muted)" }}
          aria-label="Bildirimi kapat"
        >
          <X size={14} />
        </button>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-1"
        style={{
          background: meta.accent,
          transformOrigin: "left center",
          animation: `toast-shrink ${toast.duration || 4000}ms linear forwards`,
        }}
      />
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  if (!toasts?.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}
