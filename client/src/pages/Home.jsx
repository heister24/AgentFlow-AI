import { signInWithPopup } from "firebase/auth";
import api from "../utils/api";
import { auth, googleProvider } from "../utils/firebase";
import { FcGoogle } from "react-icons/fc";

const Home = () => {
  const handleLogin = async (token) => {
    const response = await api.post("/auth/google-login", { token });
    console.log(response);
  };

  const googleLogin = async () => {
    const response = await signInWithPopup(auth, googleProvider);
    const token = await response.user.getIdToken();
    await handleLogin(token);
  };

  const handleLogout = async () => {
    try {
      const response = await api.get("/auth/logout");
      if (response) {
        console.log("logged out");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151820] p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-2 mb-8 text-center">
            <h2 className="text-2xl font-semibold">Welcome to AgentFlow-AI</h2>
            <p className="text-sm text-gray-400">Please Login to continue</p>
          </div>

          <button
            type="button"
            onClick={googleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-700 bg-white px-5 py-3 font-medium text-gray-800 transition-all duration-200 hover:bg-gray-100"
          >
            <span>Sign in with</span>
            <FcGoogle className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
