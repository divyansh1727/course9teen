import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signUpWithEmail = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: user.displayName || "User",
        email: user.email,
        phone: user.phoneNumber || "",
        imageUrl: user.photoURL || ""
      });

      navigate("/"); // Go to Home
    } catch (error) {
      alert("Sign-up failed: " + error.message);
    }
  };

  const signUpWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: user.displayName || "User",
        email: user.email,
        phone: user.phoneNumber || "",
        imageUrl: user.photoURL || ""
      });

      navigate("/"); // Go to Home
    } catch (error) {
      alert("Google sign-up failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 px-4">
      <div className="bg-white/30 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-md w-full text-black">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Your Account</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded-md text-gray-800 border border-gray-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-md text-gray-800 border border-gray-300"
          />
          <button
            onClick={signUpWithEmail}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Sign Up with Email
          </button>

          <button
            onClick={signUpWithGoogle}
            className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition border"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
