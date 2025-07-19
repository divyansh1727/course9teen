import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || "user");
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/sign-in");
  };

  if (loading) return null;

  return (
    <nav className="bg-black text-white p-6 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">9Teen-Ed</div>

      <div className="flex gap-4">
        <Link to="/" className="hover:text-yellow-300">Home</Link>

        {role === "admin" && (
          <Link to="/admin" className="hover:text-yellow-300">Admin Panel</Link>
        )}

        {role === "user" && (
          <Link to="/student-dashboard" className="hover:text-yellow-300">My Courses</Link>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
