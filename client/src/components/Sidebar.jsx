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
  Crown,
  Zap,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import AgentFlowLogo from "./AgentFlowLogo";
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

const PLAN_CONFIG = {
  plus: {
    name: "Plus",
    badgeLabel: "PLUS",
    icon: Crown,
    iconColor: "text-amber-400",
    badgeBg: "bg-linear-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20",
    badgeBorder: "border-amber-400/50",
    badgeText: "text-amber-300 font-bold tracking-wider",
    cardBg: "bg-linear-to-b from-[#251a0d]/95 to-[#161311]/95",
    cardBorder: "border-amber-500/40",
    cardGlow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    dotColor: "bg-amber-400",
    ringColor: "ring-2 ring-amber-400/70 shadow-[0_0_8px_rgba(245,158,11,0.35)]",
    upgradeText: "Manage",
    upgradeBg: "hover:bg-amber-500/20 hover:border-amber-400/50 text-amber-200",
    progressBar: "bg-linear-to-r from-amber-400 to-orange-400",
  },
  basic: {
    name: "Basic",
    badgeLabel: "BASIC",
    icon: Zap,
    iconColor: "text-cyan-400",
    badgeBg: "bg-cyan-500/15",
    badgeBorder: "border-cyan-400/50",
    badgeText: "text-cyan-300 font-bold tracking-wider",
    cardBg: "bg-linear-to-b from-[#0e1d24]/95 to-[#11161a]/95",
    cardBorder: "border-cyan-500/40",
    cardGlow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    dotColor: "bg-cyan-400",
    ringColor: "ring-2 ring-cyan-400/70 shadow-[0_0_8px_rgba(6,182,212,0.35)]",
    upgradeText: "Upgrade",
    upgradeBg: "hover:bg-cyan-500/20 hover:border-cyan-400/50 text-cyan-200",
    progressBar: "bg-linear-to-r from-cyan-400 to-blue-500",
  },
  free: {
    name: "Free",
    badgeLabel: "FREE",
    icon: Compass,
    iconColor: "text-emerald-400",
    badgeBg: "bg-white/5",
    badgeBorder: "border-white/15",
    badgeText: "text-gray-300 font-medium",
    cardBg: "bg-[#18181c]",
    cardBorder: "border-white/10",
    cardGlow: "shadow-none",
    dotColor: "bg-emerald-400",
    ringColor: "ring-1 ring-white/20",
    upgradeText: "Upgrade",
    upgradeBg: "hover:bg-white/15 text-gray-200",
    progressBar: "bg-linear-to-r from-emerald-400 to-teal-400",
  },
};

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { conversations, selectedConversation, sidebarOpen } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);

  const userPlanKey = (userData?.plan || "free").toLowerCase();
  const currentPlan = PLAN_CONFIG[userPlanKey] || PLAN_CONFIG.free;
  const PlanIcon = currentPlan.icon;
  const credits = userData?.credits ?? 100;
  const totalCredits =
    userData?.totalCredits ||
    (userPlanKey === "plus" ? 1000 : userPlanKey === "basic" ? 500 : 100);
  const creditPercent = Math.min(
    Math.max(Math.round((credits / totalCredits) * 100), 0),
    100,
  );

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
            <div
              onClick={() => navigate("/")}
              className="flex min-w-0 items-center gap-2 cursor-pointer group"
            >
              <AgentFlowLogo size={20} />
              <span className="truncate text-sm font-semibold tracking-tight text-white group-hover:text-gray-200">
                AgentFlow
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

      {/* Compact Credits & Plan Widget */}
      {sidebarOpen ? (
        <div className="mb-2.5 rounded-lg border border-white/10 bg-[#16161a] p-2.5 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            {/* Left: Plan Icon & Name + Credits count */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex items-center gap-1">
                <PlanIcon size={13} className={currentPlan.iconColor} />
                <span className="font-mono text-xs font-semibold text-white">
                  {currentPlan.name}
                </span>
              </div>
              <span className="text-gray-600 font-mono text-[10px]">•</span>
              <span className="font-mono text-[11px] text-gray-300">
                {credits.toLocaleString("en-IN")}{" "}
                <span className="text-[10px] text-gray-500 font-normal">
                  / {totalCredits.toLocaleString("en-IN")}
                </span>
              </span>
            </div>

            {/* Right: Sleek Upgrade Link */}
            <button
              type="button"
              onClick={() => navigate("/payment")}
              className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer active:scale-95 shrink-0"
            >
              <span>{currentPlan.upgradeText}</span>
              <ArrowUpRight size={10} className="text-gray-400" />
            </button>
          </div>

          {/* Minimal 2px Progress Bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-300 ${currentPlan.progressBar}`}
              style={{ width: `${creditPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-2.5 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/payment")}
            title={`${currentPlan.name} Plan • ${credits.toLocaleString("en-IN")} credits`}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white cursor-pointer active:scale-95"
          >
            <PlanIcon size={14} className={currentPlan.iconColor} />
            <span
              className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${currentPlan.dotColor}`}
            />
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
              className={`h-9 w-9 shrink-0 rounded-full object-cover ${currentPlan.ringColor}`}
            />
          ) : (
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white ${currentPlan.ringColor}`}
            >
              {userData?.name ? (
                userData.name.charAt(0).toUpperCase()
              ) : (
                <User size={15} />
              )}
            </div>
          )}

          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-medium text-white">
                  {userData?.name || "User"}
                </p>
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${currentPlan.badgeBorder} ${currentPlan.badgeBg} ${currentPlan.badgeText}`}
                >
                  {currentPlan.badgeLabel}
                </span>
              </div>
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
