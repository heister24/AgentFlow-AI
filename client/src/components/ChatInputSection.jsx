import { Mic, Paperclip, Send } from "lucide-react";
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
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);

  const chatInputRef = useRef(null);

  const handleSendRequest = async () => {
    if (input.trim().length === 0) return;

    try {
      let conversationId = selectedConversation?._id;
      if (!conversationId) {
        const conversation = await createConversation();
        dispatch(addConversation(conversation));
        dispatch(setSelectedConversation(conversation));
        conversationId = conversation._id;
      }

      dispatch(addMsgToSelectedConv({ role: "user", content: input.trim() }));
      setInput("");

      const response = await sendRequestToAgent(input, conversationId);
      // console.log(response);

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
  return (
    <div className="w-full bg-[#0d0e11] px-2 pb-2 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-[#383940] bg-[#18191d] p-3 shadow-lg transition-colors focus-within:border-[#55565f]">
          {/* Textarea */}
          <textarea
            placeholder="Ask anything..."
            ref={chatInputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleInput}
            rows={1}
            className="hide-scrollbar block w-full resize-none bg-transparent px-2 text-sm leading-6 text-gray-100 outline-none placeholder:text-gray-500 sm:text-base"
          />

          {/* Action buttons */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Attach file"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#2a2b30] hover:text-gray-100"
              >
                <Paperclip size={19} />
              </button>

              <button
                type="button"
                aria-label="Voice input"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#2a2b30] hover:text-gray-100"
              >
                <Mic size={19} />
              </button>
            </div>

            <button
              type="button"
              disabled={input.trim().length === 0}
              aria-label="Send message"
              onClick={handleSendRequest}
              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black 
                transition hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed`}
            >
              <Send size={17} />
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-gray-500">
          AgentFlow AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInputSection;
