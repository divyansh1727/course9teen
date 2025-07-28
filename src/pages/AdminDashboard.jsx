import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/sign-in");
        return;
      }

      console.log("👤 Current User UID:", user.uid);
      

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.warn("🚫 User document not found. Creating one with default admin role (dev only)");
          
          // 🔐 Optional: auto-create admin during dev
          await setDoc(userRef, {
            id: user.uid,
            name: user.displayName || "Admin",
            email: user.email || "",
            phone: user.phoneNumber || "",
            imageUrl: user.photoURL || "",
            role: "admin", // 👈 change manually for prod
            createdAt: serverTimestamp(),
          });

          setIsAdmin(true);
        } else {
          const data = userDoc.data();
          console.log("📦 Firestore user doc:", data);

          if (data.role !== "admin") {
            alert("Access Denied: Not an Admin");
            navigate("/");
            return;
          }

          setIsAdmin(true);
        }

        // ✅ Load all users
        const snapshot = await getDocs(collection(db, "users"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      } catch (err) {
        console.error("❌ Failed to check admin role:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/sign-in");
  };

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
  

        </div>

        <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
        <div className="bg-gray-700 rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="border-b border-gray-600 py-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}