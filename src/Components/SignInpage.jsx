import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { serverTimestamp } from "firebase/firestore";

export default function SignInPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid, email, phoneNumber, photoURL, displayName } = user;
        // Make sure this is imported

await setDoc(doc(db, "users", uid), {
  id: uid,
  name: displayName || "User",
  email: email || "",
  phone: phoneNumber || "",
  imageUrl: photoURL || "",
  role: "admin", // or "admin" based on use case
  createdAt: serverTimestamp(), // ✅ adds createdAt
});

        
        navigate("/");
      }
    });

    return () => unsub();
  }, []);

  const sendOtp = async () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {},
        });
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        window.recaptchaVerifier
      );
      console.log("OTP sent:", confirmation);
      window.confirmationResult = confirmation;
      setShowOtp(true);
    } catch (err) {
      console.error(err);
      alert("OTP send failed");
    }
  };

  const verifyOtp = async () => {
    try {
      await window.confirmationResult.confirm(otp);
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  const loginWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Email/Password login failed");
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: user.displayName || "User",
        email: user.email || "",
        phone: user.phoneNumber || "",
        imageUrl: user.photoURL || "",
      });

      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google sign-in failed");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 px-4">
    <div className="bg-white/30 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-md w-full text-black">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800"> Sign In to 9Teen-Ed </h2>

      {!showOtp ? (
        <>
          {/* Phone Login */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Phone (India only)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 rounded-md text-gray-800 border border-gray-300"
            />
            <button
              onClick={sendOtp}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              Send OTP
            </button>
          </div>

          <hr className="my-6 border-gray-300" />

          {/* Email Login */}
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
              onClick={loginWithEmail}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Login with Email
            </button>

            <button
              onClick={loginWithGoogle}
              className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition border"
            >
              Continue with Google
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-2 rounded-md text-gray-800 border border-gray-300"
          />
          <button
            onClick={verifyOtp}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Verify OTP
          </button>
        </div>
      )}

      <div id="recaptcha-container"></div>
    </div>
  </div>
);
}