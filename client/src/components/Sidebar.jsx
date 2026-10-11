import { PanelLeftClose, PenIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import createConversation from "../features/createConversation";
import getAllConversations from "../features/getAllConversations";
import { setConversations } from "../redux/slices/conversationSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebarOpen = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCreateNewChat = async () => {
    const response = await createConversation();
    console.log(response);
  };

  // fetch conversations
  useEffect(() => {
    const handleGetAllConversations = async () => {
      const response = await getAllConversations();
      // console.log(Array.isArray(response));
      console.log(response);
      dispatch(setConversations(response));
    };
    handleGetAllConversations();
  }, []);
  return (
    <div
      className={`h-screen ${
        sidebarOpen ? "w-[20%]" : "w-10"
      } shrink-0 border-r border-white/10 bg-[#232428] text-white p-3 transition-all duration-300`}
    >
      {/* Head panel */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div
            onClick={toggleSidebarOpen}
            className="cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <PanelLeftClose size={20} />
          </div>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span
                onClick={() => navigate("/")}
                className="font-semibold text-lg cursor-pointer whitespace-nowrap"
              >
                AgentFlow-AI
              </span>
              <span className="text-xs text-gray-400 border border-white/20 rounded-md px-2 py-0.5">
                free
              </span>
            </div>
          )}
        </div>
        <div className="cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors">
          <PenIcon onClick={handleCreateNewChat} size={20} />
        </div>
      </div>

      {/* New chat div */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleCreateNewChat}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
        >
          <span>
            <Plus size={20} />
          </span>
          {sidebarOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversation Div */}
      <div></div>
    </div>
  );
};

export default Sidebar;
