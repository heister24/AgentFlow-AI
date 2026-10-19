import { useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  Copy,
  Check,
  FileCheck,
  RotateCw,
} from "lucide-react";

export const GeneratedPdfCard = ({ href, title }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Extract clean title text
  const cleanTitle =
    typeof title === "string"
      ? title.replace(/^[📄\s*]+|[📄\s*]+$/g, "")
      : Array.isArray(title)
        ? title
            .map((t) => (typeof t === "string" ? t : t?.props?.children || ""))
            .join(" ")
            .replace(/^[📄\s*]+|[📄\s*]+$/g, "")
        : "Executive PDF Document";

  const handleCopyLink = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy PDF link:", err);
    }
  };

  const handleDownload = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (downloading || !href) return;
    setDownloading(true);

    try {
      const response = await fetch(href, { mode: "cors" });
      if (!response.ok) throw new Error("Network fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const downloadName = `${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "document"}.pdf`;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Direct blob download failed, opening directly:", err);
      window.open(href, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenPdf = (e) => {
    e?.stopPropagation();
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="my-3.5 w-full select-none">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/5">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#1c1c1c]/90 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-gray-200">
              PDF Document Ready
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy PDF URL"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] font-medium">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span className="hidden sm:inline text-[11px]">
                    Copy link
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Card Body */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* PDF Red Badge Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-500/20 to-red-600/10 border border-red-500/30 text-red-400 shadow-inner">
              <FileText size={24} />
            </div>

            {/* Document Details */}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white tracking-tight truncate" title={cleanTitle}>
                {cleanTitle || "Generated PDF Document"}
              </h4>
              <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <FileCheck size={12} /> Publication Grade
                </span>
                <span className="text-gray-600">•</span>
                <span>A4 Executive Format</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {/* View / Open Button */}
            <button
              type="button"
              onClick={handleOpenPdf}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
            >
              <ExternalLink size={13} />
              <span>View PDF</span>
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-medium text-[#111111] shadow-sm transition-all duration-200 hover:bg-gray-100 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <RotateCw size={13} className="animate-spin text-gray-800" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="border-t border-white/5 bg-[#121212] px-4 py-2 flex items-center justify-between text-[11px] text-gray-500">
          <span>Official AgentFlow AI Document</span>
          <span className="font-mono">PDFKit • Verified</span>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPdfCard;
