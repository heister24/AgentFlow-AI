import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Eye, FileCode, Layers } from "lucide-react";
import {
  setActiveArtifact,
  setArtifactOpen,
} from "../redux/slices/artifactSlice";
import GeneratedImageCard from "./GeneratedImageCard";
import GeneratedPdfCard from "./GeneratedPdfCard";

const ChatMessagesSection = () => {
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { selectedConvMsgs = [] } = useSelector((state) => state.message);
  const messagesEndRef = useRef(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvMsgs]);

  const showWelcome = !selectedConversation && selectedConvMsgs.length === 0;

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
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0d0d0d]">
      {showWelcome ? (
        <div className="flex flex-1 items-center justify-center px-5">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              How can I help you today?
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-400 sm:text-base">
              Welcome to AgentFlow AI. Ask a question, explore an idea, or start
              a conversation.
            </p>
          </div>
        </div>
      ) : (
        <div className="hide-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
          {selectedConvMsgs.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg._id || index}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] wrap-break-word sm:max-w-[82%] lg:max-w-[78%] transition-all ${
                    isUser
                      ? "rounded-2xl rounded-br-sm border border-white/10 bg-[#222222] px-4 py-3 text-white shadow-sm"
                      : "rounded-2xl rounded-bl-sm border border-white/10 bg-[#171717] px-5 py-4 text-gray-200 shadow-sm"
                  }`}
                >
                  {/* Uploaded Images */}
                  {msg.images?.length > 0 && (
                    <div
                      className={`mb-4 grid gap-3 ${
                        msg.images.length === 1
                          ? "grid-cols-1"
                          : msg.images.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-2 sm:grid-cols-3"
                      }`}
                    >
                      {msg.images.map((image, imageIndex) => (
                        <div
                          key={imageIndex}
                          className="group relative aspect-4/3 overflow-hidden rounded-xl border border-white/10 bg-[#111111]"
                        >
                          <img
                            src={image}
                            alt={`Uploaded attachment ${imageIndex + 1}`}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                      ))}
                    </div>
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
                            <div className="my-4 min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10 bg-[#101010] shadow-md">
                              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#1c1c1c] px-4 py-2">
                                <span className="text-xs font-medium font-mono text-gray-300">
                                  {language}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyCode(code, snippetId)
                                  }
                                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check
                                        size={13}
                                        className="text-emerald-400"
                                      />
                                      <span className="text-emerald-400 font-medium">
                                        Copied
                                      </span>
                                    </>
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
                            className="wrap-break-word rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-xs text-gray-200"
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
                          return <GeneratedPdfCard href={href} title={children} />;
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
                    {msg.content}
                  </Markdown>

                  {/* Sandbox Card */}
                  {!isUser && msg.artifacts?.[0]?.files?.length > 0 && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-[#1f1f1f] p-3.5 transition-colors duration-200 hover:border-white/20 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300">
                            <Layers size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">
                              Generated Code Sandbox
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {msg.artifacts[0].files.length}{" "}
                              {msg.artifacts[0].files.length === 1
                                ? "file"
                                : "files"}{" "}
                              ready
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(setActiveArtifact(msg.artifacts[0]));
                            dispatch(setArtifactOpen(true));
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-medium text-[#111111] shadow-sm transition-all duration-200 hover:bg-gray-100 active:scale-95 cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Open Sandbox</span>
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {msg.artifacts[0].files.map((file, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#141414] px-2.5 py-1 text-[11px] font-mono text-gray-300"
                          >
                            <FileCode size={13} className="text-gray-400" />
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
          <div ref={messagesEndRef} />
        </div>
      )}
    </section>
  );
};

export default ChatMessagesSection;
