import { useSelector, useDispatch } from "react-redux";
import { Layers } from "lucide-react";
import ChatInputSection from "./ChatInputSection";
import ChatMessagesSection from "./ChatMessagesSection";
import { setArtifactOpen } from "../redux/slices/artifactSlice";

const ChatArea = () => {
  const dispatch = useDispatch();
  const { activeArtifact, isOpen } = useSelector((state) => state.artifact);

  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-[#0d0d0d]">
      {/* Re-open Sandbox Pill when panel is collapsed */}
      {activeArtifact && !isOpen && (
        <button
          type="button"
          onClick={() => dispatch(setArtifactOpen(true))}
          title="Open Sandbox"
          className="absolute top-4 right-5 z-30 flex items-center gap-2 rounded-xl border border-white/10 bg-[#1c1c1c] px-3.5 py-2 text-xs font-medium text-gray-300 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200 hover:border-white/20 hover:bg-[#252525] hover:text-white cursor-pointer active:scale-95"
        >
          <Layers size={15} className="text-gray-300" />
          <span>Sandbox ({activeArtifact.files?.length || 0} files)</span>
        </button>
      )}

      <ChatMessagesSection />
      <ChatInputSection />
    </div>
  );
};

export default ChatArea;
