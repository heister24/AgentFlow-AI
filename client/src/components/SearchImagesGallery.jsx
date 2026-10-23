import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Globe,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  X,
  ImageIcon,
  Layers,
} from "lucide-react";

export const SearchImagesGallery = ({ images = [] }) => {
  // Normalize images to ensure clean string URLs
  const normalizedImages = (images || [])
    .map((img) => (typeof img === "string" ? img : img?.url || img?.src))
    .filter((url) => typeof url === "string" && url.trim().length > 0);

  const [failedUrls, setFailedUrls] = useState(new Set());
  const [loadedUrls, setLoadedUrls] = useState(new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Filter out any images that failed to load
  const validImages = normalizedImages.filter((url) => !failedUrls.has(url));

  const handleImageError = (url) => {
    setFailedUrls((prev) => new Set(prev).add(url));
  };

  const handleImageLoad = (url) => {
    setLoadedUrls((prev) => new Set(prev).add(url));
  };

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) =>
          prev > 0 ? prev - 1 : validImages.length - 1,
        );
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) =>
          prev < validImages.length - 1 ? prev + 1 : 0,
        );
      }
    },
    [selectedImageIndex, validImages.length],
  );

  useEffect(() => {
    if (selectedImageIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedImageIndex, handleKeyDown]);

  const handleDownload = async (e, url) => {
    e?.stopPropagation();
    if (downloading || !url) return;
    setDownloading(true);

    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Network fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const ext = blob.type.includes("jpeg") ? "jpg" : "png";
      link.download = `search-image-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  if (!validImages || validImages.length === 0) {
    return null;
  }

  // Display top 4 by default if more than 4 images
  const maxInitial = 4;
  const hasMore = validImages.length > maxInitial;
  const displayedImages =
    showAll || !hasMore ? validImages : validImages.slice(0, maxInitial);

  return (
    <div className="mb-4 w-full select-none">
      {/* Header bar */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-gray-300">
          <Globe size={13} className="text-cyan-400" />
          <span className="font-medium text-gray-200">Visual Results</span>
          <span className="text-[11px] text-gray-400 font-normal">
            ({validImages.length}{" "}
            {validImages.length === 1 ? "image" : "images"})
          </span>
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="retro-btn flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono text-gray-400 hover:text-white transition cursor-pointer hover:bg-white/5 active:scale-95"
          >
            <Layers size={12} />
            <span>
              {showAll ? "Show less" : `View all (${validImages.length})`}
            </span>
          </button>
        )}
      </div>

      {/* Responsive Images Grid / Container */}
      <div
        className={`grid gap-2 sm:gap-2.5 ${
          validImages.length === 1
            ? "grid-cols-1 max-w-sm"
            : validImages.length === 2
              ? "grid-cols-2 max-w-lg"
              : validImages.length === 3
                ? "grid-cols-2 sm:grid-cols-3 max-w-xl"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        }`}
      >
        {displayedImages.map((url, idx) => {
          const isLoaded = loadedUrls.has(url);
          const isLastHiddenSlot =
            !showAll && hasMore && idx === maxInitial - 1;
          const remainingCount = validImages.length - maxInitial;

          return (
            <div
              key={url + idx}
              onClick={() => {
                if (isLastHiddenSlot && remainingCount > 0) {
                  setShowAll(true);
                } else {
                  setSelectedImageIndex(idx);
                }
              }}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#121214] retro-shadow-sm transition-all duration-200 hover:border-white/25 hover:shadow-md ${
                validImages.length === 1
                  ? "h-44 sm:h-52"
                  : validImages.length === 2
                    ? "h-32 sm:h-36"
                    : "h-24 sm:h-28"
              }`}
            >
              {/* Shimmer skeleton while loading */}
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#171719] text-gray-500">
                  <ImageIcon size={18} className="animate-pulse opacity-40" />
                </div>
              )}

              {/* Thumbnail Image */}
              <img
                src={url}
                alt={`Search result ${idx + 1}`}
                loading="lazy"
                onLoad={() => handleImageLoad(url)}
                onError={() => handleImageError(url)}
                className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                <span className="flex items-center gap-1 rounded-lg border border-white/20 bg-black/60 px-2 py-1 text-[11px] font-medium text-white shadow-md">
                  <Maximize2 size={12} />
                  <span>Preview</span>
                </span>
              </div>

              {/* "+N more" badge on the last thumbnail when collapsed */}
              {isLastHiddenSlot && remainingCount > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-xs transition hover:bg-black/75">
                  <span className="text-base font-bold text-white font-mono">
                    +{remainingCount}
                  </span>
                  <span className="text-[10px] text-gray-300 font-mono">
                    more
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal rendered via Portal to escape parent CSS transforms */}
      {selectedImageIndex !== null &&
        validImages[selectedImageIndex] &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedImageIndex(null)}
            className="fixed inset-0 z-9999 flex flex-col items-center justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-md select-none animate-fade-in"
          >
            {/* Top Header Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl flex items-center justify-between pb-2 shrink-0 border-b border-white/10"
            >
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-cyan-400" />
                <span className="text-xs font-mono text-gray-300">
                  Image {selectedImageIndex + 1} of {validImages.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) =>
                    handleDownload(e, validImages[selectedImageIndex])
                  }
                  title="Download image"
                  className="retro-btn flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 cursor-pointer"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <a
                  href={validImages[selectedImageIndex]}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open original in new tab"
                  className="retro-btn flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/15 hover:text-white"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Original</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(null)}
                  title="Close (Esc)"
                  className="retro-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/15 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Middle Main Image with Prev / Next Navigation */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex-1 w-full max-w-6xl flex items-center justify-center min-h-0 py-3"
            >
              {/* Previous Button */}
              {validImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev > 0 ? prev - 1 : validImages.length - 1,
                    );
                  }}
                  title="Previous image (Left Arrow)"
                  className="absolute left-2 sm:left-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white shadow-xl backdrop-blur-md transition hover:bg-white/20 active:scale-95 cursor-pointer"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Main Image Container */}
              <div className="relative flex items-center justify-center max-h-full max-w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0d0d0d] shadow-2xl">
                <img
                  src={validImages[selectedImageIndex]}
                  alt={`Search result ${selectedImageIndex + 1}`}
                  className="max-h-[72vh] max-w-[82vw] object-contain rounded-2xl select-none"
                />
              </div>

              {/* Next Button */}
              {validImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev < validImages.length - 1 ? prev + 1 : 0,
                    );
                  }}
                  title="Next image (Right Arrow)"
                  className="absolute right-2 sm:right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white shadow-xl backdrop-blur-md transition hover:bg-white/20 active:scale-95 cursor-pointer"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip (if multiple images) */}
            {validImages.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl flex items-center justify-center gap-2 pt-2 shrink-0 overflow-x-auto hide-scrollbar"
              >
                {validImages.map((thumbUrl, idx) => (
                  <button
                    key={thumbUrl + idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-cyan-400 scale-105 shadow-md shadow-cyan-500/20"
                        : "border-white/15 opacity-60 hover:opacity-100 hover:border-white/40"
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`Thumb ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SearchImagesGallery;
