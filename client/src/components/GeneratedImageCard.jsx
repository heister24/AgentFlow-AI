import { useState, useEffect } from "react";
import {
  Download,
  Copy,
  Check,
  Maximize2,
  ExternalLink,
  RotateCw,
  Image as ImageIcon,
  X,
} from "lucide-react";

export const GeneratedImageCard = ({ src, alt = "Artwork" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleCopyLink = async (e) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleDownload = async (e) => {
    e?.stopPropagation();
    if (downloading) return;
    setDownloading(true);

    try {
      const response = await fetch(src, { mode: "cors" });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `image-${Date.now()}.${blob.type.includes("jpeg") ? "jpg" : "png"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Direct blob download failed, opening in new tab:", err);
      window.open(src, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = (e) => {
    e?.stopPropagation();
    setError(false);
    setLoaded(false);
    setRetryKey((prev) => prev + 1);
  };

  return (
    <div className="my-4 w-full select-none animate-slide-up">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] retro-card hover:border-white/25">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#1c1c1c]/90 px-3.5 py-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 retro-beacon-emerald inline-block" />
            <span className="text-xs font-medium tracking-wide text-gray-200">
              Image Preview
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy Image URL"
              className="retro-btn flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
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

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              title="Download High-Res Image"
              className="retro-btn flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/20 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {downloading ? (
                <RotateCw size={13} className="animate-spin text-gray-300" />
              ) : (
                <Download size={13} />
              )}
              <span className="hidden sm:inline text-[11px]">
                {downloading ? "Downloading..." : "Download"}
              </span>
            </button>
          </div>
        </div>

        {/* Image Container with Shimmer Skeleton */}
        <div
          className="relative min-h-65 w-full overflow-hidden bg-[#0d0d0d] cursor-pointer flex items-center justify-center"
          onClick={() => loaded && !error && setIsModalOpen(true)}
        >
          {/* Skeleton Loader while image is fetching */}
          {!loaded && !error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-linear-to-b from-[#161616] to-[#0f0f0f] p-6 text-center">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 shadow-inner">
                <ImageIcon size={20} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-200">
                  Rendering visual preview...
                </p>
                <p className="text-[11px] text-gray-500">
                  Fetching high-resolution render
                </p>
              </div>
              {/* Shimmer animation line */}
              <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-gray-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <ImageIcon size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Image failed to display
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  The preview could not be loaded
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-1 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <RotateCw size={13} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* The Image */}
          <img
            key={retryKey}
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full max-h-145 object-contain transition-all duration-500 ${
              loaded && !error ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } group-hover:scale-[1.01]`}
          />

          {/* Hover Overlay Button to Expand */}
          {loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md">
                <Maximize2 size={14} />
                <span>Click to expand high-res</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Alt Prompt Bar */}
        {alt && alt !== "Generated Image" && (
          <div className="border-t border-white/5 bg-[#121212] px-4 py-2.5 flex items-center justify-between text-xs text-gray-400">
            <span className="truncate pr-3 italic text-gray-300" title={alt}>
              &ldquo;{alt}&rdquo;
            </span>
            <span className="shrink-0 text-[10px] text-gray-500 font-mono">
              1024×1024
            </span>
          </div>
        )}
      </div>

      {/* High-Resolution Fullscreen Modal / Lightbox */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-md animate-fade-in"
        >
          {/* Modal Header Toolbar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-white/10 bg-[#1a1a1a]/80 p-1.5 backdrop-blur-lg shadow-xl"
          >
            <button
              type="button"
              onClick={handleDownload}
              title="Download image"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              title="Open original in new tab"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Open original</span>
            </a>

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              title="Close (Esc)"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Image Display */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl"
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-[88vw] object-contain rounded-2xl select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedImageCard;
