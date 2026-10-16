import {
  Code2,
  FileText,
  Globe,
  Image,
  MessageSquare,
  Mic,
  Paperclip,
  Presentation,
  Send,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import sendRequestToAgent from "../features/sendRequestToAgent";
import { useDispatch, useSelector } from "react-redux";
import { addMsgToSelectedConv } from "../redux/slices/messagesSlice";
import createConversation from "../features/createConversation";
import {
  addConversation,
  setSelectedConversation,
} from "../redux/slices/conversationSlice";

const ChatInputSection = () => {
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);

  const chatInputRef = useRef(null);

  const handleSendRequest = async () => {
    if (input.trim().length === 0) return;
    const message = input.trim();

    try {
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
        }),
      );
    } catch (error) {
      console.error(
        "Failed to send message:",
        error.response?.data || error.message,
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendRequest();
    }
  };

  // Input height
  const handleInput = () => {
    const textarea = chatInputRef.current;
    if (!textarea) return;
    // Reset height to calculate the correct height
    textarea.style.height = "auto";
    // Increase height according to content
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    // Enable scrolling when maximum height is reached
    textarea.style.overflowY = textarea.scrollHeight > 200 ? "auto" : "hidden";
  };

  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "Coding",
    },
    {
      id: "pdf",
      icon: FileText,
      label: "PDF",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },
    {
      id: "image",
      icon: Image,
      label: "Image",
    },
  ];

  return (
    <div className="w-full bg-[#0d0e11] px-3 pb-3 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-[#303139] bg-[#18191d] shadow-[0_8px_40px_rgba(0,0,0,0.22)] transition-colors duration-200 focus-within:border-[#50515e]">
          {/* Agent Selector */}
          <div className="flex max-w-full items-center gap-1 overflow-x-auto hide-scrollbar px-2 pt-1 sm:px-4">
            {agents.map((agent) => {
              const isActive = selectedAgent === agent.id;
              const AgentIcon = agent.icon;

              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent.id)}
                  aria-pressed={isActive}
                  title={agent.label}
                  className={`group flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2
                  text-xs font-medium tracking-wide transition-all duration-200 ease-out focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-blue-500/70 active:scale-95
                  ${
                    isActive
                      ? "border-blue-400/30 bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/5"
                      : "border-transparent text-gray-400 hover:border-[#383941] hover:bg-[#25262c] hover:text-gray-100"
                  }
                `}
                >
                  <AgentIcon
                    size={15}
                    strokeWidth={2}
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <span>{agent.label}</span>
                </button>
              );
            })}
          </div>

          {/* Textarea */}
          <textarea
            placeholder="Ask anything..."
            ref={chatInputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            className="hide-scrollbar block min-h-5 max-h-50 w-full resize-none overflow-y-auto bg-transparent px-5 py-3 text-[15px] leading-7 text-gray-100 outline-none placeholder:text-gray-500 sm:text-base"
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pb-1 sm:px-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Attach file"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-[#2a2b32] hover:text-white active:scale-95"
              >
                <Paperclip size={18} strokeWidth={1.8} />
              </button>

              <button
                type="button"
                aria-label="Voice input"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-[#2a2b32] hover:text-white active:scale-95"
              >
                <Mic size={18} strokeWidth={1.8} />
              </button>
            </div>

            <button
              type="button"
              disabled={input.trim().length === 0}
              aria-label="Send message"
              onClick={handleSendRequest}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-sm transition-all duration-200 hover:bg-gray-200 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
            >
              <Send size={17} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-3 text-center text-[11px] tracking-wide text-gray-500">
          AgentFlow AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInputSection;
