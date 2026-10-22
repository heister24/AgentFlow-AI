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
    <aside
      className={`flex flex-col border-l border-white/10 bg-[#121212] text-gray-200 transition-all duration-300 z-40 ${
        isFullscreen
          ? "fixed inset-0 w-screen h-screen bg-[#121212]"
          : "h-screen w-full lg:w-[48%] xl:w-[50%] shrink-0"
      }`}
    >
      {/* Top Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4 bg-[#181818]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300">
            <Layers size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-100">
              Code Sandbox
            </h3>
            <span className="text-[11px] text-gray-400">
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
          </div>
        </div>

        {/* View Switcher (Code / Preview) & Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-xl border border-white/10 bg-[#111111] p-0.5">
            <button
              type="button"
              onClick={() => dispatch(setActiveTab("code"))}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                activeTab === "code"
                  ? "border border-white/20 bg-white/10 text-white font-medium"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <Code size={14} />
              <span>Code</span>
            </button>
            <button
              type="button"
              onClick={() => dispatch(setActiveTab("preview"))}
              disabled={!hasHtml}
              title={
                hasHtml ? "Live Preview" : "No HTML file available for preview"
              }
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                activeTab === "preview"
                  ? "border border-white/20 bg-white/10 text-white font-medium"
                  : hasHtml
                    ? "border-transparent text-gray-400 hover:text-gray-200"
                    : "border-transparent text-gray-600 cursor-not-allowed"
              }`}
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          </div>

          {/* Action buttons */}
          {activeTab === "preview" && (
            <button
              type="button"
              onClick={() => setIframeKey((prev) => prev + 1)}
              title="Reload preview"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
            >
              <RefreshCw size={15} />
            </button>
          )}

          {activeTab === "code" && selectedFile && (
            <>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy current file code"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-transparent px-3 text-xs text-gray-400 transition hover:border-white/10 hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadFile}
                title={`Download ${selectedFile.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
              >
                <Download size={15} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => dispatch(toggleFullscreen())}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            type="button"
            onClick={() => dispatch(setArtifactOpen(false))}
            title="Close Sandbox"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* File Tabs Bar */}
      {files.length > 0 && (
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto hide-scrollbar border-b border-white/10 bg-[#181818] px-3 py-2">
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
                className={`group flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer active:scale-95 ${
                  isSelected
                    ? "border-white/20 bg-white/10 text-white font-medium shadow-sm"
                    : "border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-gray-100"
                }`}
              >
                <FileCode size={14} className={badgeColor} />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Body Area */}
      <div className="flex-1 min-h-0 overflow-hidden bg-[#0d0d0d] relative">
        {files.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#181818] text-gray-300 mb-3 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
              <FileCode size={22} />
            </div>
            <h4 className="text-base font-medium text-gray-200">
              No Files in Sandbox
            </h4>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              Ask the Coding Agent to generate a project or files to view and preview them in the sandbox.
            </p>
          </div>
        ) : activeTab === "preview" ? (
          <div className="h-full w-full p-2 bg-[#0d0d0d] flex flex-col">
            <div className="h-full w-full overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl">
              <iframe
                key={iframeKey}
                title="Sandbox Live Preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-modals allow-forms"
                className="h-full w-full border-none"
              />
            </div>
          </div>
        ) : (
          <div className="h-full w-full overflow-auto hide-scrollbar">
            {selectedFile ? (
              <SyntaxHighlighter
                language={getLanguage(selectedFile.name)}
                style={oneDark}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  padding: "20px",
                  background: "#101010",
                  fontSize: "13px",
                  lineHeight: "1.7",
                  minHeight: "100%",
                }}
                codeTagProps={{
                  style: {
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  },
                }}
              >
                {selectedFile.content}
              </SyntaxHighlighter>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Select a file to view code
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sandbox;
