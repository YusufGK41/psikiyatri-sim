"use client";

import {
  BookOpenText,
  ChartNoAxesCombined,
  LayoutDashboard,
  SlidersHorizontal,
} from "lucide-react";

import { joinClasses, TAB_ITEMS } from "./component-helpers";

const TAB_ICONS = {
  dashboard: LayoutDashboard,
  analiz: ChartNoAxesCombined,
  optimizasyon: SlidersHorizontal,
  metodoloji: BookOpenText,
};

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="overflow-x-auto">
      <div
        className="inline-flex min-w-full gap-2 rounded-2xl border p-2"
        style={{
          borderColor: "var(--card-border)",
          background: "color-mix(in srgb, var(--card) 94%, transparent)",
        }}
      >
        {TAB_ITEMS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={joinClasses(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                isActive ? "shadow-sm" : "hover:bg-black/5",
              )}
              style={{
                background: isActive
                  ? "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 55%, #22c55e))"
                  : "transparent",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
