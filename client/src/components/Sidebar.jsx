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
  Receipt,
  CreditCard,
  User,
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
  setSidebarOpen,
  toggleSidebar,
} from "../redux/slices/conversationSlice";
import getConversationById from "../features/getConversationById";
import deleteConversationById from "../features/deleteConversationById";
import editConversationTitle from "../features/editConversationTitle";
import logoutUser from "../features/logoutUser";
import { setUserData } from "../redux/slices/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { setSelectedConvMsg } from "../redux/slices/messagesSlice";
import {
  setActiveArtifact,
  clearArtifact,
} from "../redux/slices/artifactSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { conversations, selectedConversation, sidebarOpen } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);

  const [conversationMenuOpen, setConversationMenuOpen] = useState(null);
  const [editTitle, setEditTitle] = useState(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const toggleSidebarOpen = () => {
    dispatch(toggleSidebar());
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
        dispatch(clearArtifact());
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
        dispatch(clearArtifact());
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
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }

    try {
      const response = await getConversationById(id);
      dispatch(setSelectedConversation(response.conversation));
      dispatch(setSelectedConvMsg(response.messages));

      const lastArtifactMsg = [...(response.messages || [])]
        .reverse()
        .find(
          (m) =>
            m.artifacts &&
            m.artifacts.length > 0 &&
            m.artifacts[0].files?.length > 0,
        );

      if (lastArtifactMsg) {
        dispatch(setActiveArtifact(lastArtifactMsg.artifacts[0]));
      } else {
        dispatch(clearArtifact());
      }
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
    <>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => dispatch(setSidebarOpen(false))}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative md:z-auto flex h-screen shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#232428] p-3 text-white transition-all duration-300 ${
          sidebarOpen
            ? "w-72 max-w-[85vw] md:w-64 md:min-w-[16rem] translate-x-0 shadow-2xl md:shadow-none"
            : "-translate-x-full md:translate-x-0 md:w-16 md:min-w-16"
        }`}
      >
      {/* Header */}
      <div className="mb-4 flex min-h-10 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebarOpen}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <PanelLeftClose
              size={18}
              className={`transition-transform duration-300 ${
                sidebarOpen ? "" : "rotate-180"
              }`}
            />
          </button>

          {sidebarOpen && (
            <div className="flex min-w-0 items-center gap-2">
              <span
                onClick={() => navigate("/")}
                className="cursor-pointer truncate text-sm font-semibold tracking-tight text-white hover:text-gray-200"
              >
                AgentFlow-AI
              </span>

              {/* Dynamic Plan Badge */}
              <span className="shrink-0 rounded-md border border-white/20 px-1.5 py-0.5 text-[10px] text-gray-400 capitalize">
                {userData?.plan || "free"}
              </span>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <button
            type="button"
            onClick={handleCreateNewChat}
            title="New chat"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <PenIcon size={15} />
          </button>
        )}
      </div>

      {/* New Chat */}
      <div className="mb-4">
        <button
          type="button"
          onClick={handleCreateNewChat}
          title="New chat"
          className={`flex h-10 w-full items-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-gray-200 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white cursor-pointer retro-btn ${
            sidebarOpen ? "gap-2.5 px-3" : "justify-center px-0"
          }`}
        >
          <Plus size={18} className="shrink-0 text-gray-300" />
          {sidebarOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversation Area */}
      {sidebarOpen ? (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          <p className="mb-2 px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-500">
            [ Conversations ]
          </p>

          {conversations.length === 0 ? (
            <div className="px-2 py-6 text-center text-xs font-mono text-gray-500">
              No conversations yet
            </div>
          ) : (
            <ul className="space-y-1">
              {conversations.map((con) => {
                const isEditing = editTitle === con._id;
                const isMenuOpen = conversationMenuOpen === con._id;
                const isActive = selectedConversation?._id === con._id;

                return (
                  <li
                    key={con._id}
                    className={`group relative min-w-0 rounded-lg text-sm transition-all duration-150 ${
                      isActive
                        ? "bg-white/15 font-medium text-white retro-shadow-sm border border-white/15"
                        : "text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-0.5"
                    }`}
                  >
                    {/* Conversation title */}
                    <div className="flex min-h-9 min-w-0 items-center gap-2 px-2.5 py-1">
                      <MessageSquare
                        size={15}
                        className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-300"
                        }`}
                      />
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
                          className="h-7 min-w-0 flex-1 rounded-md border border-white/20 bg-[#1b1c20] px-2 text-xs text-white outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenConversation(con._id)}
                          title={con.title}
                          className="h-8 min-w-0 flex-1 truncate text-left text-xs cursor-pointer"
                        >
                          {con.title}
                        </button>
                      )}

                      {/* Conversation menu trigger */}
                      <button
                        type="button"
                        onClick={() => handleConversationMenu(con._id)}
                        title="Conversation options"
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer ${
                          isMenuOpen
                            ? "opacity-100 bg-white/10 text-white"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <EllipsisVertical size={14} />
                      </button>
                    </div>

                    {/* Action menu */}
                    {isMenuOpen && (
                      <div className="mx-2 mb-2 flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1b1c20] p-1.5 shadow-lg animate-pop origin-top">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              disabled={saving || !title.trim()}
                              onClick={() => handleSaveTitle(con._id)}
                              className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md bg-blue-500 px-2 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Check size={13} />
                              <span>{saving ? "Saving..." : "Save"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              title="Cancel editing"
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditTitle(con)}
                              className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md bg-white/10 px-2 text-xs font-medium text-gray-200 transition-colors hover:bg-white/15 cursor-pointer"
                            >
                              <PenIcon size={12} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteConversation(con._id)}
                              className="flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md bg-red-500/10 px-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 cursor-pointer"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Credits & Billing Quick Widget */}
      {sidebarOpen ? (
        <div className="mb-3 rounded-lg border border-white/10 bg-[#1b1c20] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-gray-300">
                <Receipt size={14} />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                  Credits
                </p>
                <p className="text-xs font-semibold text-white">
                  {(userData?.credits ?? 100).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/payment")}
              className="retro-btn flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-200 transition hover:bg-white/15 hover:text-white cursor-pointer active:scale-95"
            >
              <CreditCard size={12} className="text-gray-400" />
              <span>Billing</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-3 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/payment")}
            title={`Billing (${(userData?.credits ?? 100).toLocaleString()} credits)`}
            className="retro-btn flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <Receipt size={17} />
          </button>
        </div>
      )}

      {/* User Info and action Area */}
      <div className="border-t border-white/10 pt-3">
        <div
          className={`flex items-center ${
            sidebarOpen ? "gap-2.5" : "flex-col gap-2"
          }`}
        >
          {userData?.avatar && !avatarError ? (
            <img
              src={userData.avatar}
              alt={userData.name || "User"}
              onError={() => setAvatarError(true)}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/20"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white ring-1 ring-white/20">
              {userData?.name ? (
                userData.name.charAt(0).toUpperCase()
              ) : (
                <User size={15} />
              )}
            </div>
          )}

          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {userData?.name || "User"}
              </p>
              <p className="truncate text-[11px] text-gray-400">
                {userData?.email}
              </p>
            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogoutUser}
            title="Logout"
            aria-label="Logout"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
