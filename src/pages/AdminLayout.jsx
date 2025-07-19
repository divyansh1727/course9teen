// src/pages/AdminLayout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/sign-in");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("dashboard")}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md"
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => navigate("create-course")}
              className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md"
            >
              ➕ Create Course
            </button>
            <button
  onClick={() => navigate("manage-courses")}
  className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-md"
>
  📋 Manage Courses
</button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-green-to-red-700 px-4 py-2 rounded-md"
            >
              🔒 Logout
            </button>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
