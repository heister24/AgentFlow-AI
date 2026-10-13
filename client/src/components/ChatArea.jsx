import ChatInputSection from "./ChatInputSection";
import ChatMessagesSection from "./ChatMessagesSection";
import ChatNav from "./ChatNav";

const ChatArea = () => {
  return (
    <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-[#0d0f14]">
      <ChatNav />
      <ChatMessagesSection />
      <ChatInputSection />
    </div>
  );
};

export default ChatArea;
