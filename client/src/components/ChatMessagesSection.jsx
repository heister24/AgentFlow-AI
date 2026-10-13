import { useSelector } from "react-redux";

const ChatMessagesSection = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);

  const { selectedConvMsgs = [] } = useSelector((state) => state.message);

  const showWelcome = !selectedConversation && selectedConvMsgs.length === 0;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0d0e11]">
      {showWelcome ? (
        /* Welcome screen */
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
        /* Conversation messages */
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
          {selectedConvMsgs.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg._id}
                className={`flex w-full ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] wrap-break-word sm:max-w-[80%] lg:max-w-[75%] ${
                    isUser
                      ? "rounded-2xl rounded-br-md bg-[#27282d] px-4 py-3 text-gray-100"
                      : "text-gray-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-7 sm:text-[15px]">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ChatMessagesSection;
