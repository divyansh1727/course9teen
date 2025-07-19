import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";


export default function Home() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubCourses = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const ref = doc(db, "users", user.uid);
          const snapshot = await getDoc(ref);
          if (snapshot.exists()) {
            setUserData(snapshot.data());
          }

          unsubCourses = onSnapshot(collection(db, "courses"), (snap) => {
            const courseList = snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setCourses(courseList);
          });
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      } else {
        setUserData(null);
        setCourses([]);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubCourses) unsubCourses();
    };
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
    className="min-h-screen bg-cover bg-center bg-no-repeat text-white px-4 py-12"
    style={{
      backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(0,0,0,1)),url('/bg/9teen-ed-bg.png')`,
      backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundBlendMode: "overlay",
    }}
  >
    <div className="max-w-3xl mx-auto bg-black/60 border border-white/10 p-10 rounded-2xl text-center shadow-xl backdrop-blur-md">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight drop-shadow-sm">
        Welcome to <span className="text-[#b7c26d]">9Teen-Ed</span> 📚
      </h1>

      {loading ? (
        <p className="text-lg text-gray-300 animate-pulse">Loading...</p>
      ) : !firebaseUser ? (
        <>
          <p className="mb-6 text-lg text-gray-300">Join us and start learning smart.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/sign-in"
              className="bg-[#b7c26d] text-black font-medium px-6 py-2 rounded-full hover:bg-[#a4b55b] transition shadow"
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="bg-transparent border border-white text-white font-medium px-6 py-2 rounded-full hover:bg-white/10 transition"
            >
              Sign Up
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mb-2 text-lg text-gray-200">
            Hello, <span className="font-semibold text-[#b7c26d]">{userData?.name || "Learner"}</span> 👋
          </p>
          {userData?.email && <p className="text-sm text-gray-400">Email: {userData.email}</p>}
          {userData?.phone && <p className="text-sm text-gray-400">Phone: {userData.phone}</p>}

          <div className="mt-6 space-y-4">
            <button
              onClick={() => navigate("/student-dashboard")}
              className="w-full px-6 py-3 bg-[#b7c26d] text-black rounded-full font-semibold hover:bg-[#a4b55b] transition"
            >
              Go to Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-transparent border border-white text-white rounded-full font-semibold hover:bg-red-600 transition"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>

    {firebaseUser && courses.length > 0 && (
      <div className="max-w-6xl mx-auto mt-16 px-4">
        <h2 className="text-3xl font-semibold mb-8 text-center text-white">📘 Explore Our Courses</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="bg-black/70 hover:bg-black/80 transition cursor-pointer p-6 rounded-xl border border-white/10 shadow-md backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold text-[#b7c26d] mb-1">{course.title}</h3>
              <p className="text-gray-300 text-sm mb-2 line-clamp-3">{course.description}</p>

              {course.price && (
                <p className="text-[#e7e99e] font-medium text-sm mb-1">Price: ₹{course.price}</p>
              )}

              <p
                className={`text-sm font-semibold ${
                  course.price?.toLowerCase() === "free" || course.price === "₹0"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {course.price?.toLowerCase() === "free" || course.price === "₹0"
                  ? "Free Course"
                  : "Paid Course"}
              </p>

              {course.instructor && (
                <p className="text-sm text-gray-400 mt-2 italic">Instructor: {course.instructor}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
}

  

  