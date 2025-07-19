import { useState, useEffect } from "react";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function SignInPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) navigate("/register");
    });
  }, [navigate]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              console.log("reCAPTCHA verified");
            },
            "expired-callback": () => {
              console.warn("reCAPTCHA expired. Try again.");
            },
          },
          auth
        );
        window.recaptchaVerifier.render();
      } catch (err) {
        console.error("Recaptcha init error", err);
      }
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !phone.startsWith("+") || phone.length < 10) {
      alert("Please enter a valid phone number with country code, e.g. +919876543210");
      return;
    }

    // Uncomment the line below only for testing on localhost
    // auth.settings.appVerificationDisabledForTesting = true;

    setupRecaptcha();

    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      window.confirmationResult = confirmation;
      setShowOtpInput(true);
      console.log("OTP sent successfully");
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
       const result=await window.confirmationResult.confirm(otp);
       const user = result.user;
           const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Already registered
      navigate("/dashboard"); // or wherever your student dashboard is
    } else {
      // First time user - go to register page to fill details
      navigate("/register");
    }
    } catch (err) {
      console.error("OTP verification failed", err);
      alert("Invalid OTP");
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/register");
    } catch (err) {
      console.error("Email login error:", err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

        {/* Phone Sign-in */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Phone Number (e.g. +919876543210)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendOtp}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Send OTP
          </button>

          {showOtpInput && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleVerifyOtp}
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
              >
                Verify OTP
              </button>
            </>
          )}
        </div>

        <hr className="my-6" />

        {/* Email Sign-in */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleEmailLogin}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
          >
            Login with Email
          </button>
        </div>

        {/* Invisible reCAPTCHA */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}




