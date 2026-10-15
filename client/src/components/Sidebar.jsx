import {
  EllipsisVertical,
  PanelLeftClose,
  PenIcon,
  Plus,
  Check,
  X,
  Trash2,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import createConversation from "../features/createConversation";
import getAllConversations from "../features/getAllConversations";
import {
  addConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/slices/conversationSlice";
import getConversationById from "../features/getConversationById";
import deleteConversationById from "../features/deleteConversationById";
import editConversationTitle from "../features/editConversationTitle";
import logoutUser from "../features/logoutUser";
import { setUserData } from "../redux/slices/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { setSelectedConvMsg } from "../redux/slices/messagesSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversationMenuOpen, setConversationMenuOpen] = useState(null);
  const [editTitle, setEditTitle] = useState(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleSidebarOpen = () => {
    setSidebarOpen((prev) => !prev);
    setConversationMenuOpen(null);
  };

  const handleConversationMenu = (id) => {
    setConversationMenuOpen((prev) => (prev === id ? null : id));
  };

  // Create a new conversation
  const handleCreateNewChat = async () => {
    try {
      const response = await createConversation();

      if (response) {
        dispatch(addConversation(response));
        dispatch(setSelectedConversation(response));
        dispatch(setSelectedConvMsg([]));
        setConversationMenuOpen(null);
        setEditTitle(null);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  // Fetch conversations on mount
  useEffect(() => {
    if (!userData) return;
    const handleGetAllConversations = async () => {
      try {
        const response = await getAllConversations();
        dispatch(setConversations(response));
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };

    handleGetAllConversations();
  }, [dispatch, userData]);

  // editing a conversation title
  const handleEditTitle = (conversation) => {
    setEditTitle(conversation._id);
    setTitle(conversation.title || "");
    setConversationMenuOpen(conversation._id);
  };

  // Save the edited title
  const handleSaveTitle = async (id) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || saving) return;

    try {
      setSaving(true);

      await editConversationTitle(trimmedTitle, id);

      // Refresh the list to show the updated title.
      const response = await getAllConversations();
      dispatch(setConversations(response));

      setEditTitle(null);
      setConversationMenuOpen(null);
      setTitle("");
    } catch (error) {
      console.error("Failed to update conversation title:", error);
    } finally {
      setSaving(false);
    }
  };

  // Cancel title editing
  const handleCancelEdit = () => {
    setEditTitle(null);
    setConversationMenuOpen(null);
    setTitle("");
  };

  // Delete a conversation
  const handleDeleteConversation = async (id) => {
    try {
      await deleteConversationById(id);

      const response = await getAllConversations();
      dispatch(setConversations(response));

      if (selectedConversation?._id === id) {
        dispatch(setSelectedConvMsg([]));
        dispatch(setSelectedConversation(null));
      }

      setConversationMenuOpen(null);

      if (editTitle === id) {
        setEditTitle(null);
        setTitle("");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // Open a conversation
  const handleOpenConversation = async (id) => {
    setConversationMenuOpen(null);

    try {
      const response = await getConversationById(id);
      dispatch(setSelectedConversation(response.conversation));
      dispatch(setSelectedConvMsg(response.messages));
    } catch (error) {
      console.error("Failed to open conversation:", error);
    }
  };

  // Logout
  const handleLogoutUser = async () => {
    try {
      await logoutUser();
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      dispatch(setUserData(null));
      dispatch(setConversations([]));
      dispatch(setSelectedConversation(null));
    }
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "w-65 min-w-65" : "w-14 min-w-14"
      } flex h-screen shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#232428] p-3 text-white transition-all duration-300`}
    >
      {/* Header */}
      <div className="mb-5 flex min-h-10 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebarOpen}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <PanelLeftClose
              size={19}
              className={`transition-transform ${
                sidebarOpen ? "" : "rotate-180"
              }`}
            />
          </button>

          {sidebarOpen && (
            <div className="flex min-w-0 items-center gap-2">
              <span
                onClick={() => navigate("/")}
                className="cursor-pointer truncate text-base font-semibold"
              >
                AgentFlow-AI
              </span>

              <span className="shrink-0 rounded-md border border-white/20 px-1.5 py-0.5 text-[10px] text-gray-400">
                free
              </span>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <button
            type="button"
            onClick={handleCreateNewChat}
            title="New chat"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <PenIcon size={17} />
          </button>
        )}
      </div>

      {/* New Chat */}
      <div className="mb-5">
        <button
          type="button"
          onClick={handleCreateNewChat}
          title="New chat"
          className={`flex h-10 w-full items-center rounded-lg text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white ${
            sidebarOpen ? "gap-3 px-3" : "justify-center px-0"
          }`}
        >
          <Plus size={19} className="shrink-0" />
          {sidebarOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversation Area */}
      {sidebarOpen && (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          <p className="mb-2 px-3 text-xs font-medium text-gray-500">
            Your conversations
          </p>

          <ul className="space-y-1">
            {conversations.map((con) => {
              const isEditing = editTitle === con._id;
              const isMenuOpen = conversationMenuOpen === con._id;
              const isActive = selectedConversation?._id === con._id;

              return (
                <li
                  key={con._id}
                  className={`relative min-w-0 rounded-lg text-sm text-gray-300
                  transition-colors hover:bg-white/10 hover:text-white ${isActive ? "bg-white/15" : ""}`}
                >
                  {/* Conversation title */}
                  <div className="flex min-h-10 min-w-0 items-center gap-1 px-2">
                    <span>
                      <MessageSquare size={15} />
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={title}
                        autoFocus
                        maxLength={100}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveTitle(con._id);
                          }

                          if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        placeholder="Conversation title"
                        className="h-8 min-w-0 flex-1 rounded-md border border-white/20 bg-[#1b1c20] px-2 text-sm text-white outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenConversation(con._id)}
                        title={con.title}
                        className="h-9 min-w-0 flex-1 truncate rounded-md px-1 text-left text-sm"
                      >
                        {con.title}
                      </button>
                    )}

                    {/* Conversation menu */}
                    <button
                      type="button"
                      onClick={() => handleConversationMenu(con._id)}
                      title="Conversation options"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <EllipsisVertical size={17} />
                    </button>
                  </div>

                  {/* Action menu */}
                  {isMenuOpen && (
                    <div className="mx-2 mb-2 flex items-center gap-2 rounded-lg border border-white/10 bg-[#1b1c20] p-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            disabled={saving || !title.trim()}
                            onClick={() => handleSaveTitle(con._id)}
                            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-500 px-2 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={14} />
                            {saving ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            title="Cancel editing"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditTitle(con)}
                            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-blue-500/15 px-2 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/25"
                          >
                            <PenIcon size={13} />
                            Edit title
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteConversation(con._id)}
                            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-red-500/10 px-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* User Info and action Area */}
      <div
        className={`mt-auto border-t border-white/10 ${
          sidebarOpen ? "pt-4" : "pt-3"
        }`}
      >
        <div
          className={`flex items-center ${
            sidebarOpen ? "gap-3" : "flex-col gap-3"
          }`}
        >
          <img
            src={userData?.avatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/20"
          />
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {userData?.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {userData?.email}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogoutUser}
            title="Logout"
            aria-label="Logout"
            className={`flex h-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white ${
              sidebarOpen ? "w-9 shrink-0" : "w-8"
            }`}
          >
            <LogOut size={17} />
            {sidebarOpen && <span className="sr-only">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
