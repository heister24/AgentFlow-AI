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
  const [promptDraft, setPromptDraft] = useState(null);

  const handleSelectPrompt = (prompt, agent) => {
    setPromptDraft({ prompt, agent, timestamp: Date.now() });
  };

  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-[#0d0d0d] retro-grid">
      {/* Mobile Sidebar Hamburger Toggle */}
      <div className="absolute top-3.5 left-4 z-30 md:hidden w-fit pointer-events-auto">
        <button
          type="button"
          onClick={() => dispatch(setSidebarOpen(true))}
          title="Open Menu"
          className="retro-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#1b1c20]/95 text-gray-200 shadow-md backdrop-blur-md transition-all hover:border-white/30 hover:bg-[#232428] hover:text-white cursor-pointer active:scale-95"
        >
          <PanelLeft size={16} />
        </button>
      </div>

      {/* Compact Sandbox Button on the right side */}
      {activeArtifact && !isOpen && (
        <div className="absolute top-3.5 right-4 z-30 w-fit pointer-events-auto animate-slide-up">
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
