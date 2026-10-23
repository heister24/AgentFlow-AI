import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layers, PanelLeft } from "lucide-react";
import ChatInputSection from "./ChatInputSection";
import ChatMessagesSection from "./ChatMessagesSection";
import { setArtifactOpen } from "../redux/slices/artifactSlice";
import { setSidebarOpen } from "../redux/slices/conversationSlice";

const ChatArea = () => {
  const dispatch = useDispatch();
  const { activeArtifact, isOpen } = useSelector((state) => state.artifact);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const [promptDraft, setPromptDraft] = useState(null);

  const handleSelectPrompt = (prompt, agent) => {
    setPromptDraft({ prompt, agent, timestamp: Date.now() });
  };

  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-[#0d0d0d] retro-grid">
      {/* Mobile Top Navigation Header */}
      <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-white/10 bg-[#121214]/95 px-3 backdrop-blur-md md:hidden z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => dispatch(setSidebarOpen(true))}
            title="Open Menu"
            aria-label="Open conversation menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <PanelLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate text-xs font-semibold tracking-tight text-white font-mono">
              {selectedConversation?.title || "AgentFlow"}
            </span>
          </div>
        </div>

        {/* Mobile Sandbox Toggle if code artifact exists */}
        {activeArtifact && !isOpen && (
          <button
            type="button"
            onClick={() => dispatch(setArtifactOpen(true))}
            title="Open Sandbox"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-mono font-medium text-white transition hover:bg-white/15 active:scale-95 cursor-pointer"
          >
            <Layers size={13} className="text-gray-300" />
            <span>Sandbox</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </button>
        )}
      </header>

      {/* Desktop Floating Sandbox Button */}
      {activeArtifact && !isOpen && (
        <div className="hidden md:block absolute top-3.5 right-4 z-30 w-fit pointer-events-auto animate-slide-up">
          <button
            type="button"
            onClick={() => dispatch(setArtifactOpen(true))}
            title="Open Code Sandbox"
            className="retro-btn inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 bg-[#1b1c20]/95 px-3 py-1.5 text-xs font-mono font-medium text-gray-200 shadow-md backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-[#232428] hover:text-white cursor-pointer active:scale-95"
          >
            <Layers size={13} className="text-gray-300" />
            <span>Sandbox ({activeArtifact.files?.length || 0})</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 retro-beacon-emerald" />
          </button>
        </div>
      )}

      <ChatMessagesSection onSelectPrompt={handleSelectPrompt} />
      <ChatInputSection promptDraft={promptDraft} />
    </div>
  );
};

export default ChatArea;
