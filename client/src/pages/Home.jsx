import { signInWithPopup } from "firebase/auth";
import api from "../utils/api";
import { auth, googleProvider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/slices/userSlice";

import ChatArea from "../components/ChatArea";
import Artifact from "../components/Artifact";
import Sidebar from "../components/Sidebar";

const Home = () => {
  const { userData, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogin = async (token) => {
    try {
      const response = await api.post("/auth/google-login", { token });
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
      <div className="h-screen w-full flex items-center justify-center bg-[#0d0f14] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-[#0d0f14] text-white overflow-hidden">
      {userData ? (
        <div className="flex h-full w-full">
          <Sidebar />
          <ChatArea />
          <Artifact />
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151820] p-8 shadow-2xl shadow-black/50">
            <div className="flex flex-col gap-2 mb-8 text-center">
              <h2 className="text-2xl font-semibold">
                Welcome to AgentFlow-AI
              </h2>
              <p className="text-sm text-gray-400">Please Login to continue</p>
            </div>

            <button
              type="button"
              onClick={googleLogin}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-700 bg-white px-5 py-3 font-medium text-gray-800 transition-all duration-200 hover:bg-gray-100"
            >
              <span>Sign in with</span>
              <FcGoogle className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
