"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

export default function PdfExport({ dashboardRef, addToast }) {
  const [loading, setLoading] = useState(false);

  const exportPdf = async () => {
    if (!dashboardRef?.current) {
      addToast?.("PDF icin once dashboard olusturulmalidir.", "error");
      return;
    }

    setLoading(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(imageData, "PNG", margin, position, imageWidth, imageHeight, undefined, "FAST");
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight + margin;
        pdf.addPage();
        pdf.addImage(
          imageData,
          "PNG",
          margin,
          position,
          imageWidth,
          imageHeight,
          undefined,
          "FAST",
        );
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`psikiyatri-dashboard-${new Date().toISOString().slice(0, 16)}.pdf`);
      addToast?.("PDF hazirlandi ve indirildi.", "success");
    } catch (error) {
      addToast?.(
        error?.message || "PDF olusturulurken beklenmeyen bir hata olustu.",
        "error",
        6000,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={exportPdf}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        borderColor: "var(--card-border)",
        background: "var(--card)",
        color: "var(--text-secondary)",
      }}
    >
      <FileText size={14} />
      <span className="hidden sm:inline">{loading ? "PDF hazirlaniyor" : "PDF indir"}</span>
    </button>
  );
}
