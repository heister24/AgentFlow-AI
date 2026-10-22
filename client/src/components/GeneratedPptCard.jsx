import { useState } from "react";
import {
  Presentation,
  Download,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
} from "lucide-react";

export const GeneratedPptCard = ({ href, title }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Extract clean title text
  const cleanTitle =
    typeof title === "string"
      ? title.replace(/^[📊\s*]+|[📊\s*]+$/gu, "")
      : Array.isArray(title)
        ? title
            .map((t) => (typeof t === "string" ? t : t?.props?.children || ""))
            .join(" ")
            .replace(/^[📊\s*]+|[📊\s*]+$/gu, "")
        : "Executive Presentation";

  const handleCopyLink = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy presentation link:", err);
    }
  };

  const handleDownload = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (downloading || !href) return;
    setDownloading(true);

    try {
      const downloadName = `${
        cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "presentation"
      }.pptx`;

      if (href.startsWith("data:")) {
        // Direct base64 download
        const link = document.createElement("a");
        link.href = href;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // S3 or remote URL download
        const response = await fetch(href, { mode: "cors" });
        if (!response.ok) throw new Error("Network fetch failed");
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.warn("Direct blob download failed, opening directly:", err);
      window.open(href, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenPpt = (e) => {
    e?.stopPropagation();
    if (href.startsWith("data:")) {
      handleDownload(e);
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="my-3.5 w-full select-none animate-slide-up">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] retro-card hover:border-amber-500/35">
        {/* Animated download progress strip */}
        {downloading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500/30 overflow-hidden z-20">
            <div className="h-full w-full bg-linear-to-r from-amber-400 via-orange-400 to-amber-400 animate-shimmer" />
          </div>
        )}

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#1c1c1c]/90 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 retro-beacon-amber inline-block" />
            <span className="text-xs font-medium tracking-wide text-gray-200">
              PowerPoint Deck Ready
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Presentation URL"
              className="retro-btn flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-400 animate-pop">
                  <Check size={13} />
                  <span className="text-[11px] font-medium">Copied</span>
                </span>
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
            {/* PowerPoint Amber/Orange Badge Icon with interactive hover scale */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 to-orange-600/15 border border-orange-500/30 text-orange-400 shadow-inner transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
              <Presentation size={24} />
            </div>

            {/* Presentation Details */}
            <div className="min-w-0 flex-1">
              <h4
                className="text-sm font-semibold text-white tracking-tight truncate group-hover:text-amber-200/90 transition-colors"
                title={cleanTitle}
              >
                {cleanTitle || "Presentation"}
              </h4>
              <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                <span className="text-gray-300 font-medium">
                  Slide-Ready
                </span>
                <span className="text-gray-600">•</span>
                <span>16:9 Widescreen</span>
                <span className="text-gray-600">•</span>
                <span className="font-mono text-[11px] text-gray-400">.pptx</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {/* Open / Preview Button */}
            {!href.startsWith("data:") && (
              <button
                type="button"
                onClick={handleOpenPpt}
                className="retro-btn flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
              >
                <ExternalLink size={13} />
                <span>View URL</span>
              </button>
            )}

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="retro-btn flex items-center gap-1.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium px-3.5 py-1.5 text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <RotateCw size={13} className="animate-spin text-white" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Download size={13} />
                  <span>Download .pptx</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="border-t border-white/5 bg-[#121212] px-4 py-2 flex items-center justify-between text-[11px] text-gray-500">
          <span>AgentFlow Presentation Document</span>
          <span className="font-mono">PptxGenJS • Verified</span>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPptCard;
