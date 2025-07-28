// All imports remain the same
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { collection, doc, getDoc, getDocs, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

import { db, auth } from "../firebase";
import CourseCard from "../Components/CourseCard";
import ParticlesBackground from "../Components/ParticlesBackground";
import CategoryFilter from "../Components/CategoryFilter";
import InstructorCard from "../Components/InstructorCard";
import TestimonialsSection from "../Components/TestimonialsSection";


export default function Home() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const welcomeRef = useRef(null);

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
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }

      try {
        unsubCourses = onSnapshot(collection(db, "courses"), (snap) => {
          const courseList = snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setCourses(courseList);
          const free = courseList.filter((c) => c.price?.toString() === "0");
          setFreeCourses(free);
        });
      } catch (err) {
        console.error("Error fetching courses:", err);
      }

      setLoading(false);
    });

    const fetchInstructors = async () => {
      try {
        const snap = await getDocs(collection(db, "instructors"));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInstructors(list);
      } catch (err) {
        console.error("Error fetching instructors:", err);
      }
    };

    fetchInstructors();

    return () => {
      unsubAuth();
      if (unsubCourses) unsubCourses();
    };
  }, []);

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((course) => course.category === selectedCategory);

  const searchedCourses = filteredCourses.filter((course) =>
    course.title?.toLowerCase().includes(searchTerm)
  );

  const searchedInstructors = instructors.filter((instructor) =>
    instructor.name?.toLowerCase().includes(searchTerm)
  );

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
      className="min-h-screen bg-cover bg-center text-white relative px-4 py-12"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(0,0,0,1)),url('/bg/9teen-ed-bg.png')`,
      }}
    >
      <div className="absolute inset-0 -z-10">
        <ParticlesBackground />
      </div>

      {/* Welcome Section */}
      <motion.div
        ref={welcomeRef}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto mt-12"
      >
        <h1 className="text-5xl font-extrabold mb-6 text-yellow-300 drop-shadow-lg">
          Welcome to 9Teen-Ed 🚀
        </h1>

        {loading ? (
          <p className="text-lg text-gray-300 animate-pulse">Loading...</p>
        ) : !firebaseUser ? (
          <>
            <p className="text-lg text-gray-300 mb-6">
              Learn from the best, upskill your career, and transform your future — one module at a time!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/sign-in" className="bg-yellow-400 text-black px-6 py-2 rounded-full font-medium">
                Sign In
              </Link>
              <Link to="/sign-up" className="border border-white px-6 py-2 rounded-full">
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg text-white mb-2">
              Hello, <span className="font-semibold text-yellow-300">{userData?.name || "Learner"}</span> 👋
            </p>
            {userData?.email && <p className="text-sm text-gray-300">Email: {userData.email}</p>}
            {userData?.phone && <p className="text-sm text-gray-300">Phone: {userData.phone}</p>}
            <div className="mt-6 space-y-4">
              <button
                onClick={() => navigate("/student-dashboard")}
                className="w-full px-6 py-3 bg-yellow-400 text-black rounded-full font-semibold"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 border border-white text-white rounded-full font-semibold hover:bg-red-600 transition"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Search Input */}
      <div className="max-w-xl mx-auto mt-10 mb-6">
        <input
          type="text"
          placeholder="Search courses or instructors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          className="w-full px-4 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* Course Section */}
      {searchedCourses.length > 0 ? (
        <div className="max-w-6xl mx-auto mt-16 px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center text-white">📘 Explore Our Courses</h2>
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {searchedCourses.map((course) => (
              <CourseCard
                key={course.id}
                courseId={course.id}
                course={course}
                isAdmin={userData?.role === "admin"}
                onClick={() => navigate(`/course/${course.id}`)}
                onEditClick={() => navigate(`/admin/edit-course/${course.id}`)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-6">No courses match your search.</p>
      )}

      {/* Free Courses Section */}
      {freeCourses.length > 0 && (
        <div className="max-w-6xl mx-auto mt-20 px-4">
          <h2 className="text-3xl font-bold text-yellow-300 mb-6 text-center">🆓 Free Courses to Get Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {freeCourses.map((course) => (
              <CourseCard
                key={course.id}
                courseId={course.id}
                course={course}
                isAdmin={userData?.role === "admin"}
                onClick={() => navigate(`/course/${course.id}`)}
                onEditClick={() => navigate(`/admin/edit-course/${course.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ✅ Testimonials Section */}
<div className="mt-20">
  <TestimonialsSection />
</div>

      

      {/* Instructors Section */}
      <div className="mt-16 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">Meet Our Instructors</h2>
        {searchedInstructors.length === 0 ? (
          <p className="text-gray-400">No instructors found.</p>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4">
            {searchedInstructors.map((instructor) => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                courseCount={instructor.courseCount}
                onClick={() => navigate(`/instructor/${instructor.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ✅ FAQ Section */}
      <div className="max-w-4xl mx-auto mt-20 px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-8">🙋‍♀️ Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-yellow-300 font-semibold">How do I enroll in a course?</h3>
            <p className="text-gray-300 mt-2">Simply sign in, browse courses, and click "Enroll" on any course page.</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-yellow-300 font-semibold">Are the free courses really free?</h3>
            <p className="text-gray-300 mt-2">Yes! Free courses are accessible without any payment or subscription.</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h3 className="text-yellow-300 font-semibold">Can I become an instructor?</h3>
            <p className="text-gray-300 mt-2">Yes, reach out to us via the Contact page to apply as an instructor.</p>
          </div>
        </div>
      </div>

      {/* ✅ Footer Info */}
      <div className="max-w-6xl mx-auto mt-24 px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-6">💡 Why Learn with 9Teen-Ed?</h2>
        <div className="bg-black/50 p-6 rounded-xl text-center border border-gray-600">
          <p className="text-gray-300">
            👨‍🏫 Expert Instructors | 🎯 Career-Aligned Courses | 📈 Progress Tracking | 💬 Community Support
          </p>
        </div>
      </div>
    </div>
  );
}
