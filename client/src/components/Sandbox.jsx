import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Code,
  Eye,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  X,
  FileCode,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  setSelectedFileName,
  setActiveTab,
  setArtifactOpen,
  toggleFullscreen,
} from "../redux/slices/artifactSlice";

const getLanguage = (fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "html":
      return "html";
    case "css":
      return "css";
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "jsx":
      return "jsx";
    case "ts":
      return "typescript";
    case "tsx":
      return "tsx";
    case "json":
      return "json";
    case "py":
      return "python";
    case "sql":
      return "sql";
    default:
      return "text";
  }
};

const getFileBadgeColor = (fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "html":
      return "text-orange-400";
    case "css":
      return "text-sky-400";
    case "js":
    case "jsx":
      return "text-amber-300";
    case "ts":
    case "tsx":
      return "text-blue-400";
    case "json":
      return "text-emerald-400";
    case "py":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
};

const Sandbox = () => {
  const dispatch = useDispatch();
  const { activeArtifact, selectedFileName, activeTab, isOpen, isFullscreen } =
    useSelector((state) => state.artifact);

  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const files = useMemo(
    () => activeArtifact?.files || [],
    [activeArtifact?.files],
  );

  const selectedFile = useMemo(() => {
    if (!files.length) return null;
    return files.find((f) => f.name === selectedFileName) || files[0];
  }, [files, selectedFileName]);

  const hasHtml = useMemo(() => {
    return files.some((f) => f.name?.toLowerCase().endsWith(".html"));
  }, [files]);

  const previewHtml = useMemo(() => {
    if (!files.length) return "";
    const htmlFile = files.find((f) =>
      f.name?.toLowerCase().endsWith(".html"),
    );
    const cssFiles = files.filter((f) =>
      f.name?.toLowerCase().endsWith(".css"),
    );
    const jsFiles = files.filter((f) => f.name?.toLowerCase().endsWith(".js"));

    let html = htmlFile
      ? htmlFile.content
      : "<!DOCTYPE html><html><body style='font-family:system-ui,sans-serif;padding:32px;color:#94a3b8;background:#111111'><h2>No HTML File Found</h2><p>Switch to the Code tab to view generated source files.</p></body></html>";

    const combinedCss = cssFiles.map((c) => c.content).join("\n\n");
    if (combinedCss) {
      const styleTag = `<style>\n${combinedCss}\n</style>`;
      if (html.includes("</head>")) {
        html = html.replace("</head>", `${styleTag}\n</head>`);
      } else {
        html = `${styleTag}\n${html}`;
      }
    }

    const combinedJs = jsFiles.map((j) => j.content).join("\n\n");
    if (combinedJs) {
      const scriptTag = `<script>\ntry {\n${combinedJs}\n} catch (err) { console.error(err); }\n</script>`;
      if (html.includes("</body>")) {
        html = html.replace("</body>", `${scriptTag}\n</body>`);
      } else {
        html = `${html}\n${scriptTag}`;
      }
    }

    return html;
  }, [files]);

  const handleCopyCode = async () => {
    if (!selectedFile?.content) return;
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadFile = () => {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Drawer Backdrop on screens < 1024px */}
      <div
        onClick={() => dispatch(setArtifactOpen(false))}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden animate-fade-in"
      />

      <aside
        className={`flex flex-col border-l border-white/15 bg-[#141416] text-gray-200 transition-all duration-300 z-50 retro-shadow-dark ${
          isFullscreen
            ? "fixed inset-0 w-screen h-screen bg-[#141416]"
            : "fixed inset-y-0 right-0 w-full sm:w-[520px] md:w-[600px] lg:relative lg:inset-auto lg:h-screen lg:w-[48%] xl:w-[50%] shrink-0 shadow-2xl lg:shadow-none"
        }`}
      >
      {/* Top Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 bg-[#1b1c20]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-gray-300 retro-shadow-sm">
            <Layers size={15} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              Code Sandbox
            </h3>
            <span className="text-[11px] font-mono text-gray-400">
              [ {files.length} {files.length === 1 ? "file" : "files"} ]
            </span>
          </div>
        </div>

        {/* View Switcher (Code / Preview) & Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-white/15 bg-[#111111] p-0.5 retro-shadow-sm">
            <button
              type="button"
              onClick={() => dispatch(setActiveTab("code"))}
              className={`retro-btn flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono transition cursor-pointer ${
                activeTab === "code"
                  ? "border border-white/20 bg-white/15 text-white font-medium"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Code size={13} />
              <span>Code</span>
            </button>
            <button
              type="button"
              onClick={() => dispatch(setActiveTab("preview"))}
              disabled={!hasHtml}
              title={
                hasHtml ? "Live Preview" : "No HTML file available for preview"
              }
              className={`retro-btn flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono transition cursor-pointer ${
                activeTab === "preview"
                  ? "border border-white/20 bg-white/15 text-white font-medium"
                  : hasHtml
                    ? "border-transparent text-gray-400 hover:text-gray-200"
                    : "border-transparent text-gray-600 cursor-not-allowed shadow-none"
              }`}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
          </div>

          {/* Action buttons */}
          {activeTab === "preview" && (
            <button
              type="button"
              onClick={() => setIframeKey((prev) => prev + 1)}
              title="Reload preview"
              className="retro-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/15 hover:text-white cursor-pointer active:scale-95"
            >
              <RefreshCw size={14} />
            </button>
          )}

          {activeTab === "code" && selectedFile && (
            <>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy current file code"
                className="retro-btn flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-mono text-gray-300 transition hover:bg-white/15 hover:text-white cursor-pointer active:scale-95"
              >
                {copied ? (
                  <span className="flex items-center gap-1 text-emerald-400 animate-pop font-medium">
                    <Check size={13} />
                    <span>Copied</span>
                  </span>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                title={`Download ${selectedFile.name}`}
                className="retro-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/15 hover:text-white cursor-pointer active:scale-95"
              >
                <Download size={14} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => dispatch(toggleFullscreen())}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="retro-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/15 hover:text-white cursor-pointer active:scale-95"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            onClick={() => dispatch(setArtifactOpen(false))}
            title="Close Sandbox"
            className="retro-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 cursor-pointer active:scale-95"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* File Tabs Bar */}
      {files.length > 0 && (
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto hide-scrollbar border-b border-white/10 bg-[#161618] px-3 py-2">
          {files.map((file) => {
            const isSelected = selectedFile?.name === file.name;
            const badgeColor = getFileBadgeColor(file.name);

            return (
              <button
                key={file.name}
                type="button"
                onClick={() => {
                  dispatch(setSelectedFileName(file.name));
                  if (
                    activeTab === "preview" &&
                    !file.name.toLowerCase().endsWith(".html")
                  ) {
                    dispatch(setActiveTab("code"));
                  }
                }}
                className={`retro-btn group flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-mono transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? "border-white/25 bg-white/15 text-white font-medium retro-shadow-sm"
                    : "border-white/5 bg-white/5 text-gray-400 hover:border-white/15 hover:bg-white/10 hover:text-gray-200"
                }`}
              >
                <FileCode size={13} className={badgeColor} />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Body Area */}
      <div className="flex-1 min-h-0 overflow-hidden bg-[#0d0d0d] relative retro-grid">
        {files.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center animate-slide-up">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-mono text-gray-300 mb-4 retro-shadow-sm">
              <span className="text-amber-400 font-bold">&gt;</span>
              <span>SANDBOX_IDLE</span>
              <span className="inline-block w-1.5 h-3.5 bg-amber-400 retro-cursor ml-1" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#181818] text-gray-300 mb-3 retro-shadow-sm">
              <FileCode size={22} />
            </div>
            <h4 className="text-base font-semibold text-gray-100">
              No Files in Sandbox
            </h4>
            <p className="mt-1 text-xs font-mono text-gray-400 max-w-sm">
              Ask the Coding Agent to build a project to inspect and test files live.
            </p>
          </div>
        ) : activeTab === "preview" ? (
          <div className="h-full w-full p-3 bg-transparent flex flex-col animate-slide-up">
            <div className="h-full w-full overflow-hidden rounded-xl border border-white/15 bg-white retro-shadow-dark flex flex-col">
              {/* Retro browser mockup bar */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-3 py-1.5 text-xs select-none">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-0.5 text-[11px] font-mono text-gray-600 shadow-inner">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span>localhost:3000/preview</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 uppercase">
                  HTML5
                </span>
              </div>
              <iframe
                key={iframeKey}
                title="Sandbox Live Preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-modals allow-forms"
                className="h-full w-full border-none flex-1"
              />
            </div>
          </div>
        ) : (
          <div className="h-full w-full overflow-auto hide-scrollbar animate-slide-up">
            {selectedFile ? (
              <SyntaxHighlighter
                language={getLanguage(selectedFile.name)}
                style={oneDark}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  padding: "20px",
                  background: "#101012",
                  fontSize: "13px",
                  lineHeight: "1.7",
                  minHeight: "100%",
                }}
                codeTagProps={{
                  style: {
                    fontFamily:
                      "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  },
                }}
              >
                {selectedFile.content}
              </SyntaxHighlighter>
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-mono text-gray-500">
                Select a file to inspect code
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
    </>
  );
};

export default Sandbox;
