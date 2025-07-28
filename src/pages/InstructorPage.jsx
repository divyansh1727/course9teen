import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

export default function InstructorPage() {
  const { instructorId } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorAndCourses = async () => {
      try {
        const instructorRef = doc(db, "instructors", instructorId);
        const instructorSnap = await getDoc(instructorRef);

        if (instructorSnap.exists()) {
          const instructorData = instructorSnap.data();
          setInstructor(instructorData);

          const q = query(
            collection(db, "courses"),
            where("createdBy", "==", instructorId)
          );
          const querySnap = await getDocs(q);
          const courseList = querySnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCourses(courseList);
        } else {
          setInstructor(null);
        }
      } catch (err) {
        console.error("Error loading instructor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorAndCourses();
  }, [instructorId]);

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!instructor) return <div className="text-red-400 p-6">❌ Instructor not found</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* ✅ Top Profile Section */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-6 mb-10 border border-gray-700">
          <img
            src={`/instructors/${instructor.photoURL }`}
            alt={instructor.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-yellow-400"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-1 text-yellow-400">👨‍🏫 {instructor.name}</h1>
            <p className="text-gray-400 italic">{instructor.bio}</p>
            <p className="mt-2 text-sm text-gray-500">📚 {courses.length} Course{courses.length !== 1 && "s"}</p>
          </div>
        </div>

        {/* ✅ Course List */}
        <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Courses by {instructor.name}</h2>
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700"
              >
                <h3 className="text-yellow-300 text-lg font-bold mb-1">{course.title}</h3>
                <p className="text-gray-300">{course.description}</p>
                <p className="text-sm mt-2 text-gray-400">
                  Duration: {course.duration} | Modules: {course.modules?.length || 0}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No courses found for this instructor.</p>
        )}
      </div>
    </div>
  );
}
