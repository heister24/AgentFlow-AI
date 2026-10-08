import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./utils/firebase";
import api from "./utils/api";

const App = () => {
  const handleLogin = async (token) => {
    const response = await api.post("/auth/google-login", { token });
    console.log(response);
  };
  const googleLogin = async () => {
    const response = await signInWithPopup(auth, googleProvider);
    const token = await response.user.getIdToken();
    await handleLogin(token);
  };
  return (
    <div className="flex min-h-screen justify-center items-center">
      <button
        onClick={googleLogin}
        className="w-50 h-10 bg-blue-500 text-white border rounded-full"
      >
        Continue with google
      </button>
    </div>
  );
};

export default App;
