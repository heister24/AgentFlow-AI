// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "agentflow-7a5dc.firebaseapp.com",
  projectId: "agentflow-7a5dc",
  storageBucket: "agentflow-7a5dc.firebasestorage.app",
  messagingSenderId: "694939867486",
  appId: "1:694939867486:web:9ec4e01229f6c4b91a97cf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
