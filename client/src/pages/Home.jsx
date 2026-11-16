import { signInWithPopup } from "firebase/auth";
import api from "../utils/api";
import { auth, googleProvider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/slices/userSlice";

import ChatArea from "../components/ChatArea";
import Sandbox from "../components/Sandbox";
import Sidebar from "../components/Sidebar";
import AgentFlowLogo from "../components/AgentFlowLogo";
import usePageMeta from "../hooks/usePageMeta";

const Home = () => {
  const { userData, loading } = useSelector((state) => state.user);
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Dynamic Page-Specific Meta Title & Description
  usePageMeta({
    title: selectedConversation?.title
      ? `${selectedConversation.title} — AgentFlow`
      : "AgentFlow — Autonomous AI Workflows & Intelligence",
    description: selectedConversation?.title
      ? `Conversation "${selectedConversation.title}" on AgentFlow. Multi-agent workflows, code sandbox, presentations, and live web intelligence.`
      : "AgentFlow is an autonomous AI agent platform combining real-time web search, interactive React code sandboxes, presentation generation, and deep reasoning workflows.",
    keywords:
      "AgentFlow, AI agents, autonomous workflow, React sandbox, web search, AI presentations",
  });

  const handleLogin = async (token) => {
    try {
      const response = await api.post("/auth/google-login", { token });
      if (response.data.sessionId) {
        localStorage.setItem("sessionId", response.data.sessionId);
      }
      dispatch(setUserData(response.data.user));
    } catch (error) {
      console.error("Login verification failed:", error);
    }
  };

  const googleLogin = async () => {
    try {
      const response = await signInWithPopup(auth, googleProvider);
      const token = await response.user.getIdToken();
      await handleLogin(token);
    } catch (error) {
      console.error("Google sign-in popup error:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0B0B0C] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8102E]/30 border-t-[#C8102E]" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-[#0B0B0C] text-white overflow-hidden">
      {userData ? (
        <div className="flex h-full w-full relative">
          <Sidebar />
          <ChatArea />
          <Sandbox />
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#262833] bg-[#121317] p-6 sm:p-8 shadow-2xl shadow-black/80 animate-fade-in text-center">
            {/* Header / Brand */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <AgentFlowLogo size={46} className="mb-1" />
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                Welcome to AgentFlow
              </h2>
              <p className="text-xs text-[#8A8D93]">
                Sign in to access your autonomous AI workspaces.
              </p>
            </div>

            {/* Primary Google Login Button */}
            <button
              type="button"
              onClick={googleLogin}
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-gray-100 hover:shadow-[0_0_15px_rgba(255,255,255,0.25)] active:scale-[0.99]"
            >
              <FcGoogle className="text-lg shrink-0" />
              <span>Continue with Google</span>
            </button>

            {/* Privacy & Terms Links */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[#8A8D93] font-mono">
              <button
                type="button"
                onClick={() => navigate("/privacy")}
                className="hover:text-[#FF4D68] transition cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate("/terms")}
                className="hover:text-[#FF4D68] transition cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
