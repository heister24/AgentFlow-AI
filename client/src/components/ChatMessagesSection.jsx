import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatMessagesSection = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { selectedConvMsgs = [] } = useSelector((state) => state.message);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvMsgs]);

  const showWelcome = !selectedConversation && selectedConvMsgs.length === 0;

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0d0e11]">
      {showWelcome ? (
        <div className="flex flex-1 items-center justify-center px-5">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-100 sm:text-3xl">
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
                  className={`max-w-[90%] wrap-break-word sm:max-w-[80%] lg:max-w-[75%] ${isUser ? "rounded-2xl rounded-br-md bg-[#212123] px-4 py-3 text-gray-100" : "rounded-2xl rounded-bl-md border border-[#282b36] bg-[#1a1c23] px-5 py-3.5 text-gray-200"}`}
                >
                  {msg.images?.length > 0 && (
                    <div
                      className={`mb-4 grid gap-3 ${msg.images.length === 1 ? "grid-cols-1" : msg.images.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}
                    >
                      {msg.images.map((image, imageIndex) => (
                        <div
                          key={imageIndex}
                          className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-[#111318]"
                        >
                          <img
                            src={image}
                            alt={`Uploaded image ${imageIndex + 1}`}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2.5 text-[15px] leading-7 last:mb-0">
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
                        <li className="leading-7">{children}</li>
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
                        <blockquote className="my-2.5 border-l-3 border-gray-500 pl-3 italic text-gray-300">
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

                          return (
                            <div className="my-4 min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10">
                              <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-[#171922] px-4 py-2">
                                <span className="text-xs font-medium capitalize text-gray-400">
                                  {language}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(code)}
                                  className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
                                >
                                  Copy code
                                </button>
                              </div>

                              <SyntaxHighlighter
                                language={language}
                                style={oneDark}
                                PreTag="div"
                                customStyle={{
                                  margin: 0,
                                  padding: "16px",
                                  background: "#0f1015",
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
                            className="break-words rounded bg-[#282b37] px-1.5 py-0.5 font-mono text-xs text-sky-300"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },

                      hr: () => <hr className="my-3 border-white/10" />,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">
                          {children}
                        </strong>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          {children}
                        </a>
                      ),
                      table: ({ children }) => (
                        <div className="my-4 max-w-full overflow-x-auto rounded-lg border border-white/10">
                          <table className="w-full border-collapse text-left text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-[#252833] text-gray-100">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="border border-white/10 px-3 py-2 font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-white/10 px-3 py-2 text-gray-300">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {msg.content}
                  </Markdown>
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
