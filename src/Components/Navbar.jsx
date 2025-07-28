import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where, limit } from "firebase/firestore";

export default function Navbar() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [freeCourses, setFreeCourses] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || "user");
        }
      } else {
        setRole(null); // For public visitors
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchFreeCourses = async () => {
      try {
        const q = query(collection(db, "courses"), where("price","in", ["Free", "0"]));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFreeCourses(data);
        console.log("Free courses:", data); 
      } catch (err) {
        console.error("Error fetching free courses", err);
      }
    };
    fetchFreeCourses();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/sign-in");
  };

  if (loading) return null;

  return (
    <nav className="bg-black text-white p-6 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">9Teen-Ed</div>

      <div className="flex gap-4 items-center relative">
        <Link to="/" className="hover:text-yellow-300">Home</Link>

        {/* ✅ Free Courses Hover Dropdown */}
        {(role === "user" || role === null) && (
          <div className="relative group">
            <span className="hover:text-yellow-300 cursor-pointer font-medium text-base">
  Free Courses
</span>


            {/* Dropdown on hover */}
            <div className="absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white border border-white/10 rounded-lg p-4 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
              <p className="text-sm mb-2 text-yellow-300 font-semibold">Preview:</p>
              {freeCourses.length === 0 ? (
                <p className="text-center text-gray-400">No free courses available</p>
              ) : (
                
                  freeCourses.map((course) => (
                    
                      <Link
                      key={course.id}
                        to={`/course/${course.id}`}
                        className="block border border-gray-700 rounded-md p-3 hover:bg-gray-800 transition duration-200"
                      ><div className="font-semibold text-yellow-300 text-base">{course.title}</div>
        <div className="text-gray-300 text-sm mt-1">
          {course.instructor && <p>👨‍🏫 {course.instructor}</p>}
          {course.duration && <p>🕒 Duration: {course.duration}</p>}
          {course.modules?.length > 0 && <p>📚 Modules: {course.modules.length}</p>}
          <p className="text-green-400 font-medium mt-1">💸 Free</p>
        </div>

                        
                      </Link>
                    
                  ))
                
              )}
              <div className="mt-3 text-right">
                <Link
                  to="/free-courses"
                  className="text-blue-400 text-xs hover:underline"
                >
                  View all →
                </Link>
              </div>
            </div>
          </div>
        )}

        {role === "admin" && (
          <Link to="/admin/dashboard" className="hover:text-yellow-300">Admin Panel</Link>
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
