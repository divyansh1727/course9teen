import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminManageCourses() {
  const [courses, setCourses] = useState([]);
  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        try {
          const q = query(
            collection(db, "courses"),
            where("createdBy", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const courseList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCourses(courseList);
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsub();
  }, []);

  const handleDelete = async (courseId) => {
    const confirm = window.confirm("Are you sure you want to delete this course?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "courses", courseId));
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  if (loading) return <div className="text-white p-4">Loading courses...</div>;

  return (
    <div className="min-h-screen p-6 text-white bg-black">
      <h1 className="text-3xl font-bold mb-6">Manage Your Courses</h1>

      {courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-900 rounded-xl p-4 shadow-md flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold mb-1">{course.title}</h2>
                <p className="text-sm mb-2">{course.description}</p>
                <p className="text-xs text-gray-400">Category: {course.category}</p>
                <p className="text-xs text-gray-400">Duration: {course.duration}</p>
                <p className="text-xs text-gray-400">
                  Instructor: {course.instructor || "Unknown"}
                </p>
                <p className="text-xs text-gray-400">Price: ₹{course.price === "Free" ? "💸 Free": `₹${course.price}`}</p>
                <p className="text-xs text-gray-400">
                  Modules: {course.modules?.length || 0}
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate(`/admin/edit-course/${course.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

