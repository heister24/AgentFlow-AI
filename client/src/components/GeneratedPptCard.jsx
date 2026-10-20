import { useState } from "react";
import {
  Presentation,
  Download,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  Sparkles,
} from "lucide-react";

export const GeneratedPptCard = ({ href, title }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Extract clean title text
  const cleanTitle =
    typeof title === "string"
      ? title.replace(/^[📊\s*]+|[📊\s*]+$/g, "")
      : Array.isArray(title)
        ? title
            .map((t) => (typeof t === "string" ? t : t?.props?.children || ""))
            .join(" ")
            .replace(/^[📊\s*]+|[📊\s*]+$/g, "")
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
    <div className="my-3.5 w-full select-none">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-xl transition-all duration-300 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/5">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#1c1c1c]/90 px-4 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wide text-gray-200">
              PowerPoint Deck Ready
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Presentation URL"
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
            {/* PowerPoint Amber/Orange Badge Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 to-orange-600/15 border border-orange-500/30 text-orange-400 shadow-inner">
              <Presentation size={24} />
            </div>

            {/* Presentation Details */}
            <div className="min-w-0 flex-1">
              <h4
                className="text-sm font-semibold text-white tracking-tight truncate"
                title={cleanTitle}
              >
                {cleanTitle || "Generated Presentation"}
              </h4>
              <p className="mt-0.5 text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <Sparkles size={12} /> Slide-Ready
                </span>
                <span className="text-gray-600">•</span>
                <span>16:9 Widescreen</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">.pptx Format</span>
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
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
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
              className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium px-3.5 py-1.5 text-xs shadow-md transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
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
          <span>Official AgentFlow AI Presentation</span>
          <span className="font-mono">PptxGenJS • Verified</span>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPptCard;
