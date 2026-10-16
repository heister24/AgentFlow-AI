import ChatInputSection from "./ChatInputSection";
import ChatMessagesSection from "./ChatMessagesSection";

const ChatArea = () => {
  return (
    <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-[#0d0f14]">
      <ChatMessagesSection />
      <ChatInputSection />
    </div>
  );
};

export default ChatArea;
