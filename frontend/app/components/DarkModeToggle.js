"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    } catch {
      // Local storage may be unavailable in private browsing contexts.
    }
  }, [darkMode]);

  return (
    <button
      type="button"
      aria-label={darkMode ? "Acik moda gec" : "Karanlik moda gec"}
      aria-pressed={darkMode}
      onClick={() => setDarkMode((prev) => !prev)}
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5"
      style={{
        borderColor: "var(--card-border)",
        background:
          "linear-gradient(135deg, var(--card), color-mix(in srgb, var(--primary) 10%, var(--card)))",
        color: "var(--text-secondary)",
      }}
    >
      {darkMode ? <SunMedium size={15} /> : <MoonStar size={15} />}
      <span className="hidden sm:inline">{darkMode ? "Acik mod" : "Koyu mod"}</span>
    </button>
  );
}
