import {
  ChevronDown,
  Code2,
  FileText,
  Globe,
  Image,
  Loader2,
  MessageSquare,
  Mic,
  Paperclip,
  Presentation,
  Send,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import sendRequestToAgent from "../features/sendRequestToAgent";
import { useDispatch, useSelector } from "react-redux";
import { addMsgToSelectedConv } from "../redux/slices/messagesSlice";
import createConversation from "../features/createConversation";
import {
  addConversation,
  setSelectedConversation,
} from "../redux/slices/conversationSlice";
import { setActiveArtifact } from "../redux/slices/artifactSlice";
import getCurrentUser from "../features/getCurrentUser";
import { setUserData } from "../redux/slices/userSlice";

const ChatInputSection = () => {
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);

  const chatInputRef = useRef(null);
  const menuRef = useRef(null);

  // Close agent dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAgentMenuOpen(false);
      }
    };
    if (agentMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [agentMenuOpen]);

  const handleSendRequest = async () => {
    if (input.trim().length === 0 || isSubmitting) return;
    const message = input.trim();

    try {
      setIsSubmitting(true);
      let conversationId = selectedConversation?._id;
      if (!conversationId) {
        const conversation = await createConversation();
        dispatch(addConversation(conversation));
        dispatch(setSelectedConversation(conversation));
        conversationId = conversation._id;
      }

      dispatch(addMsgToSelectedConv({ role: "user", content: message }));
      setInput("");

      if (chatInputRef.current) {
        chatInputRef.current.style.height = "auto";
        chatInputRef.current.style.overflowY = "hidden";
      }

      const response = await sendRequestToAgent(
        message,
        conversationId,
        selectedAgent.toLowerCase(),
      );

      dispatch(
        addMsgToSelectedConv({
          role: "assistant",
          content: response.aiResponse,
          images: response?.images,
          artifacts: response?.artifacts,
        }),
      );

      if (response?.artifacts && response.artifacts.length > 0) {
        dispatch(setActiveArtifact(response.artifacts[0]));
      }

      const updatedUser = await getCurrentUser();
      if (updatedUser) {
        dispatch(setUserData(updatedUser));
      }
    } catch (error) {
      console.error(
        "Failed to send message:",
        error.response?.data || error.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendRequest();
    }
  };

  const handleInput = () => {
    const textarea = chatInputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 180 ? "auto" : "hidden";
  };

  const agents = [
    { id: "auto", icon: Zap, label: "Auto" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "search", icon: Globe, label: "Search" },
    { id: "coding", icon: Code2, label: "Coding" },
    { id: "pdf", icon: FileText, label: "PDF" },
    { id: "ppt", icon: Presentation, label: "PPT" },
    { id: "image", icon: Image, label: "Image" },
  ];

  const currentAgent = agents.find((a) => a.id === selectedAgent) || agents[0];
  const AgentIcon = currentAgent.icon;

  return (
    <div className="w-full bg-[#0d0d0d] px-3 pb-3 sm:px-6 sm:pb-4">
      <div className="mx-auto w-full max-w-3xl">
        {/* Compact, professional input box matching Sidebar theme */}
        <div className="relative rounded-2xl border border-white/10 bg-[#202020] shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all duration-200">
          {/* Textarea */}
          <textarea
            placeholder={`Ask ${selectedAgent === "auto" ? "anything" : selectedAgent + " agent"}...`}
            ref={chatInputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            rows={1}
            className="hide-scrollbar block min-h-10.5 max-h-48 w-full resize-none overflow-y-auto bg-transparent px-4 pt-3 pb-1 text-[14px] leading-6 text-white outline-none disabled:opacity-60 sm:text-[15px]"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1.5" ref={menuRef}>
              {/* Compact Agent Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAgentMenuOpen((prev) => !prev)}
                  title="Switch Agent"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
                >
                  <AgentIcon size={13} className="text-gray-300" />
                  <span>{currentAgent.label}</span>
                  <ChevronDown
                    size={12}
                    className={`text-gray-400 transition-transform duration-200 ${
                      agentMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Floating Agent Menu */}
                {agentMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-44 rounded-xl border border-white/10 bg-[#1a1a1a] p-1.5 shadow-2xl backdrop-blur-md z-50">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                      Select Agent
                    </div>
                    {agents.map((agent) => {
                      const isSelected = selectedAgent === agent.id;
                      const Icon = agent.icon;
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => {
                            setSelectedAgent(agent.id);
                            setAgentMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer ${
                            isSelected
                              ? "bg-white/10 text-white font-medium"
                              : "text-gray-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <Icon
                            size={14}
                            className={
                              isSelected ? "text-white" : "text-gray-400"
                            }
                          />
                          <span>{agent.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Attach File Button */}
              <button
                type="button"
                aria-label="Attach file"
                title="Attach file"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
              >
                <Paperclip size={16} strokeWidth={1.8} />
              </button>

              {/* Voice Input Button */}
              <button
                type="button"
                aria-label="Voice input"
                title="Voice input"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
              >
                <Mic size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* Right Controls: Hint & Send Button */}
            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] text-gray-500 sm:inline">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono text-[10px] text-gray-400">
                  Enter
                </kbd>
              </span>

              <button
                type="button"
                disabled={input.trim().length === 0 || isSubmitting}
                aria-label="Send message"
                onClick={handleSendRequest}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#151820] shadow-sm transition-all duration-200 hover:bg-gray-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin text-gray-700" />
                ) : (
                  <Send size={15} strokeWidth={2.2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-2 text-center text-[11px] tracking-wide text-gray-500">
          AgentFlow AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInputSection;
