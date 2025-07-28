import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaBookOpen, FaCheckCircle } from "react-icons/fa";


export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    const fetchCourseAndInstructor = async () => {
      try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          setCourse(courseData);
          console.log("Instructor ID in course:", courseData.createdBy);

          // ✅ Fetch instructor from createdBy field
          if (courseData.createdBy) {
            const instructorRef = doc(db, "users", courseData.createdBy);
            const instructorSnap = await getDoc(instructorRef);

            if (instructorSnap.exists()) {
              setInstructor(instructorSnap.data());
            } else {
              console.warn("Instructor not found");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching course/instructor:", err);
      }
    };

    fetchCourseAndInstructor();
  }, [courseId]);

  if (!course) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto bg-gray-900 rounded-xl p-8 shadow-lg border border-yellow-500">
        {/* Title & Description */}
        <h1 className="text-4xl font-bold mb-4 text-yellow-400">{course.title}</h1>
        <p className="text-gray-300 mb-4">{course.description}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6 items-center">
          {instructor ? (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(`/instructor/${course.createdBy}`)}
            >
              <img
                src={instructor.photoURL || divyanshPhoto}
                alt={instructor.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-white"
              />
              <span className="underline text-yellow-300 font-medium">
                👨‍🏫 {instructor.name}
              </span>
            </div>
          ) : (
            <span className="text-red-400">❌ Instructor Not Found</span>
          )}

          <span>
            <FaBookOpen className="inline mr-1 text-yellow-500" />
            Category: {course.category || "General"}
          </span>

          <span>
            <FaCheckCircle className="inline mr-1 text-green-500" />
            Duration: {course.duration || "Self-paced"}
          </span>

          <span>📚 Modules: {course.modules?.length || 0}</span>
        </div>

        {/* More UI can go here */}
      </div>
    </div>
  );
}


