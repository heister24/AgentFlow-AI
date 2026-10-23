import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Check,
  Copy,
  Eye,
  FileCode,
  FileText,
  Layers,
  X,
  Download,
  Globe,
  Code2,
  Presentation,
  Lightbulb,
} from "lucide-react";
import {
  setActiveArtifact,
  setArtifactOpen,
} from "../redux/slices/artifactSlice";
import GeneratedImageCard from "./GeneratedImageCard";
import GeneratedPdfCard from "./GeneratedPdfCard";
import GeneratedPptCard from "./GeneratedPptCard";
import SearchImagesGallery from "./SearchImagesGallery";
import AgentFlowLogo from "./AgentFlowLogo";

const QUICK_PROMPTS = [
  {
    label: "Search web",
    prompt: "What are the latest breakthroughs in space exploration and technology?",
    agent: "search",
    icon: Globe,
    iconColor: "text-cyan-400",
  },
  {
    label: "Build React app",
    prompt: "Build a sleek retro Pomodoro timer web app with stats and audio",
    agent: "coding",
    icon: Code2,
    iconColor: "text-indigo-400",
  },
  {
    label: "Pitch deck",
    prompt: "Create a 5-slide pitch deck for an autonomous drone logistics startup",
    agent: "ppt",
    icon: Presentation,
    iconColor: "text-amber-400",
  },
  {
    label: "Brainstorm",
    prompt: "Compare monolithic vs microservice architectures with pros and cons",
    agent: "chat",
    icon: Lightbulb,
    iconColor: "text-emerald-400",
  },
];

const ChatMessagesSection = ({ onSelectPrompt }) => {
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { selectedConvMsgs = [], isAgentThinking = false } = useSelector(
    (state) => state.message,
  );
  const messagesEndRef = useRef(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvMsgs, isAgentThinking]);

  const showWelcome = selectedConvMsgs.length === 0;

  const handleCopyCode = async (code, indexKey) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(indexKey);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      {showWelcome ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-6">
          <div className="flex flex-col items-center text-center max-w-md space-y-3.5 animate-fade-in">
            {/* Unique AgentFlow Logo Mark */}
            <div className="flex items-center justify-center mb-1">
              <AgentFlowLogo size={36} className="transition-transform duration-300 hover:scale-105" />
            </div>

            {/* Clean Headline */}
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white/90">
                How can I help you today?
              </h1>
              <p className="mt-1 text-xs text-gray-400">
                Ask a question, write code, build pitch decks, or search live web.
              </p>
            </div>

            {/* Compact suggestion pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {QUICK_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectPrompt?.(item.prompt, item.agent)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:text-white cursor-pointer active:scale-95"
                  >
                    <Icon size={13} className={item.iconColor} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="hide-scrollbar flex-1 space-y-6 overflow-y-auto px-4 pt-10 pb-6 sm:px-8 sm:pt-12 lg:px-12">
          {selectedConvMsgs.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg._id || index}
                className={`flex w-full animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] break-words sm:max-w-[82%] lg:max-w-[78%] transition-all ${
                    isUser
                      ? "rounded-xl rounded-br-sm border border-white/15 bg-[#222222] px-4 py-3 text-white retro-shadow-sm"
                      : "rounded-xl rounded-bl-sm border border-white/15 bg-[#171717] px-5 py-4 text-gray-200 retro-shadow-sm"
                  }`}
                >
                  {/* Uploaded File (e.g. PDF) */}
                  {msg.fileName && (
                    <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#141416] px-3 py-1.5 text-xs text-gray-200">
                      <FileText size={14} className="text-red-400 shrink-0" />
                      <span className="font-medium truncate max-w-56">
                        {msg.fileName}
                      </span>
                    </div>
                  )}

                  {/* User Uploaded Images */}
                  {isUser && msg.images?.length > 0 && (
                    <div
                      className={`mb-3 flex flex-wrap gap-2 ${
                        msg.images.length === 1 ? "justify-end" : "justify-end"
                      }`}
                    >
                      {msg.images.map((image, imageIndex) => {
                        const imgUrl =
                          typeof image === "string"
                            ? image
                            : image?.url || image?.src;
                        if (!imgUrl) return null;

                        return (
                          <div
                            key={imageIndex}
                            onClick={() => setPreviewModalUrl(imgUrl)}
                            className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-[#121214] retro-shadow-sm max-w-xs max-h-56 transition-all duration-200 hover:border-white/30"
                          >
                            <img
                              src={imgUrl}
                              alt={`Uploaded attachment ${imageIndex + 1}`}
                              loading="lazy"
                              className="h-auto max-h-52 w-auto max-w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Assistant Web Search Visual Results */}
                  {!isUser && msg.images?.length > 0 && (
                    <SearchImagesGallery images={msg.images} />
                  )}

                  {/* Markdown Content */}
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="text-[15px] leading-7 last:mb-0 text-gray-200">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-2.5 ml-5 list-disc space-y-1 text-[15px] leading-7 marker:text-gray-400">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-2.5 ml-5 list-decimal space-y-1 text-[15px] leading-7 marker:text-gray-400">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-7 text-gray-200">{children}</li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="mb-2 mt-4 text-xl font-bold text-white">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-2 mt-3 text-lg font-semibold text-white">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-1 mt-2.5 text-base font-semibold text-gray-100">
                          {children}
                        </h3>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="my-2.5 rounded-r-lg border-l-2 border-white/30 bg-white/5 pl-3.5 py-1 italic text-gray-300">
                          {children}
                        </blockquote>
                      ),

                      code: ({ children, className, ...props }) => {
                        const match = /language-([\w+-]+)/.exec(
                          className || "",
                        );
                        const code = String(children).replace(/\n$/, "");
                        const isBlock = Boolean(match);

                        if (isBlock) {
                          const language = match[1].toLowerCase();
                          const snippetId = `${index}-${code.slice(0, 15)}`;
                          const isCopied = copiedCodeIndex === snippetId;

                          return (
                            <div className="my-4 min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#101010] retro-shadow-sm transition-all">
                              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#1c1c1c] px-4 py-2">
                                <span className="text-xs font-medium font-mono text-gray-300">
                                  {language}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyCode(code, snippetId)
                                  }
                                  className="retro-btn flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
                                >
                                  {isCopied ? (
                                    <span className="flex items-center gap-1 text-emerald-400 animate-pop font-medium">
                                      <Check size={13} />
                                      <span>Copied</span>
                                    </span>
                                  ) : (
                                    <>
                                      <Copy size={13} />
                                      <span>Copy code</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <SyntaxHighlighter
                                language={language}
                                style={oneDark}
                                PreTag="div"
                                customStyle={{
                                  margin: 0,
                                  padding: "16px",
                                  background: "#101010",
                                  fontSize: "13px",
                                  lineHeight: "1.7",
                                  overflowX: "auto",
                                  borderRadius: 0,
                                  maxWidth: "100%",
                                }}
                                codeTagProps={{
                                  style: {
                                    fontFamily:
                                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                                  },
                                }}
                                wrapLongLines={false}
                              >
                                {code}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }

                        return (
                          <code
                            className="break-words rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-xs text-gray-200"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },

                      img: ({ src, alt }) => (
                        <GeneratedImageCard src={src} alt={alt} />
                      ),
                      hr: () => <hr className="my-4 border-white/10" />,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">
                          {children}
                        </strong>
                      ),
                      a: ({ href, children }) => {
                        const isPdf =
                          href?.toLowerCase().includes(".pdf") ||
                          href?.includes("/pdf-") ||
                          href?.includes("application/pdf") ||
                          (typeof children === "string" &&
                            children.toLowerCase().includes("pdf"));

                        if (isPdf) {
                          return (
                            <GeneratedPdfCard href={href} title={children} />
                          );
                        }

                        const isPpt =
                          href?.toLowerCase().includes(".pptx") ||
                          href?.toLowerCase().includes(".ppt") ||
                          href?.includes("/ppt-") ||
                          href?.includes("presentationml") ||
                          (typeof children === "string" &&
                            (children.toLowerCase().includes("powerpoint") ||
                              children.toLowerCase().includes("presentation") ||
                              children.toLowerCase().includes("ppt")));

                        if (isPpt) {
                          return (
                            <GeneratedPptCard href={href} title={children} />
                          );
                        }

                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/40 hover:decoration-indigo-300 transition"
                          >
                            {children}
                          </a>
                        );
                      },
                      table: ({ children }) => (
                        <div className="my-4 max-w-full overflow-x-auto rounded-xl border border-white/10 bg-[#161616]">
                          <table className="w-full border-collapse text-left text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-[#1f1f1f] text-gray-100 border-b border-white/10">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="border border-white/10 px-3.5 py-2 font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-white/10 px-3.5 py-2 text-gray-300">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {(msg.content || "")
                      .replace(
                        /\*?Secure S3 (?:presentation )?download link generated by AgentFlow AI\.?\*?/gi,
                        "",
                      )
                      .trim()}
                  </Markdown>

                  {/* Sandbox Card */}
                  {!isUser && msg.artifacts?.[0]?.files?.length > 0 && (
                    <div className="mt-4 rounded-xl border border-white/15 bg-[#1a1a1c] p-3.5 retro-shadow-sm transition-all duration-200">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-gray-300 retro-shadow-sm">
                            <Layers size={15} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">
                              Code Sandbox
                            </div>
                            <div className="text-[11px] font-mono text-gray-400">
                              [ {msg.artifacts[0].files.length}{" "}
                              {msg.artifacts[0].files.length === 1
                                ? "file"
                                : "files"}{" "}
                              ready ]
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(setActiveArtifact(msg.artifacts[0]));
                            dispatch(setArtifactOpen(true));
                          }}
                          className="retro-btn flex items-center gap-1.5 rounded-lg border border-white/15 bg-white px-3.5 py-1.5 text-xs font-mono font-medium text-[#111111] shadow-sm transition-all hover:bg-gray-100 active:scale-95 cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Open Sandbox</span>
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {msg.artifacts[0].files.map((file, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#121214] px-2.5 py-1 text-[11px] font-mono text-gray-300"
                          >
                            <FileCode size={12} className="text-gray-400" />
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Agent Processing / Thinking Indicator */}
          {isAgentThinking && (
            <div className="flex w-full justify-start animate-slide-up">
              <div className="flex items-center gap-2.5 rounded-xl rounded-bl-sm border border-white/15 bg-[#171717] px-4 py-2.5 text-xs font-mono text-gray-300 retro-shadow-sm">
                <span className="text-emerald-400 font-bold">&gt;</span>
                <span className="tracking-wide text-gray-300">PROCESSING</span>
                <span className="inline-flex items-center gap-1 ml-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* User Uploaded Image Lightbox Modal */}
      {previewModalUrl &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setPreviewModalUrl(null)}
            className="fixed inset-0 z-9999 flex flex-col items-center justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-md select-none animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl flex items-center justify-between pb-2 shrink-0 border-b border-white/10"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400 inline-block" />
                <span className="text-xs font-mono text-gray-300">
                  Attachment Preview
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewModalUrl}
                  download="attachment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  className="retro-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/15 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex-1 w-full max-w-6xl flex items-center justify-center min-h-0 py-3"
            >
              <div className="relative flex items-center justify-center max-h-full max-w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0d0d0d] shadow-2xl">
                <img
                  src={previewModalUrl}
                  alt="Attachment Preview"
                  className="max-h-[75vh] max-w-[85vw] object-contain rounded-2xl select-none"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
};

export default ChatMessagesSection;
