"use client";

import { useState } from "react";
import { Expand, X } from "lucide-react";

export default function FullscreenChart({
  title,
  description,
  renderContent,
  buttonClassName = "",
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-black/5 ${buttonClassName}`}
        style={{ color: "var(--text-secondary)" }}
      >
        <Expand size={14} />
        Tam ekran
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
        >
          <div className="card flex h-[min(90vh,56rem)] w-full max-w-6xl flex-col rounded-3xl border shadow-2xl">
            <div
              className="flex items-start justify-between gap-4 border-b px-5 py-4"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h3>
                {description ? (
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 transition-colors hover:bg-black/5"
                aria-label="Tam ekran gorunumunu kapat"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 p-4 md:p-6">{renderContent?.({ fullscreen: true })}</div>
          </div>
        </div>
      )}
    </>
  );
}
