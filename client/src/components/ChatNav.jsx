import { useSelector } from "react-redux";
import { MessageSquare } from "lucide-react";

const ChatNav = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);

  const { selectedConvMsgs = [] } = useSelector((state) => state.message);

  return (
    <header className="w-full border-b border-[#303136] bg-[#0d0e11]">
      {selectedConversation && (
        <div className="flex min-h-15 items-center justify-between gap-4 px-5 sm:px-6">
          {/* Conversation title */}
          <div className="flex min-w-0 items-center gap-3">
            <MessageSquare size={19} className="shrink-0 text-gray-400" />

            <p className="truncate text-sm font-medium text-gray-100 sm:text-base">
              {selectedConversation?.title || "New Chat"}
            </p>
          </div>

          {/* Message count */}
          <div className="shrink-0 rounded-md border border-[#303136] px-3 py-1.5">
            <p className="text-xs text-gray-400 sm:text-sm">
              Total Messages:{" "}
              <span className="font-medium text-gray-200">
                {selectedConvMsgs.length}
              </span>
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default ChatNav;
