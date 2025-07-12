import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function Home() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state and fetch Firestore user data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const ref = doc(db, "users", user.uid);
          const snapshot = await getDoc(ref);
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          } else {
            console.warn("No user data found in Firestore");
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFirebaseUser(null);
      setUserData(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div
  className="min-h-screen bg-black bg-cover bg-center bg-no-repeat flex items-center justify-center text-white px-4"
  style={{
    backgroundImage:`linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.9)), url('https://www.9teeninitiative.com/image/tech-illustration.png')`,
  }}>
  
  <div className="backdrop-blur-md bg-white/5 border border-white/10 p-10 rounded-3xl text-center shadow-2xl max-w-lg w-full">
    <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-md">
      Welcome to <span className="text-purple-400">9Teen-Ed</span> 📚
    </h1>


        {loading ? (
          <p className="text-lg">Loading...</p>
        ) : !firebaseUser ? (
          <>
            <p className="mb-4 text-xl">Join us to explore and learn!!!</p>
            <div className="flex justify-center gap-12">
              <Link
                to="/sign-in"
                className="bg-white text-purple-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="bg-white text-purple-700 font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-100 transition"
              >
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-lg">
              Hi, <span className="font-semibold">{userData?.name || "User"}</span> 👋
            </p>
            {userData?.email && <p className="mb-2 text-sm">Email: {userData.email}</p>}
            {userData?.phone && <p className="mb-2 text-sm">Phone: {userData.phone}</p>}
            {!userData && (
              <p className="mb-4 text-yellow-100">Setting up your account, please wait...</p>
            )}
            <button
              onClick={handleLogout}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}


