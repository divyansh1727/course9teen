// src/pages/ManageCourses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async (uid) => {
    try {
      const q = query(
        collection(db, "courses"),
        where("createdBy", "==", uid) // ✅ Only fetch admin's courses
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
  };

  const handleDelete = async (courseId) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await deleteDoc(doc(db, "courses", courseId));
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCourses(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📋 Manage Your Courses</h2>

      {loading ? (
        <p>Loading...</p>
      ) : courses.length === 0 ? (
        <p>No courses found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-gray-800 p-4 rounded shadow">
              <h3 className="text-xl font-semibold">{course.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{course.description}</p>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-yellow-600 rounded"
                  onClick={() => navigate(`/admin/edit-course/${course.id}`)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 rounded"
                  onClick={() => handleDelete(course.id)}
                >
                  🗑️ Delete
                </button>
              </div>

              {course.modules?.length > 0 ? (
                course.modules.map((mod, i) => (
                  <div key={i} className="bg-gray-700 p-3 rounded mt-3">
                    <h4 className="text-md font-semibold">
                      Module {i + 1}: {mod.title}
                    </h4>
                    {mod.hasTest ? (
                      <button
                        className="mt-2 px-3 py-1 bg-yellow-500 rounded text-black"
                        onClick={() =>
                          navigate(`/admin/test/${course.id}/${i}`)
                        }
                      >
                        Edit Test
                      </button>
                    ) : (
                      <button
                        className="mt-2 px-3 py-1 bg-green-600 rounded"
                        onClick={() =>
                          navigate(`/admin/test/${course.id}/${i}`)
                        }
                      >
                        Create Test
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 mt-2 italic">No modules yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

