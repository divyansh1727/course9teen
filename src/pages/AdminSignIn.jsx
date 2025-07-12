import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const adminEmail = "admin@coursesell.com"; // 🔐 Set your admin email

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      if (result.user.email !== adminEmail) {
        setError("You are not authorized as admin.");
        return;
      }

      navigate("/admin");
    } catch (err) {
      setError("Login failed. Check credentials.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            className="w-full p-2 rounded-md text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded-md text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-md"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
