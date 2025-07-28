import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CourseCard from "../Components/CourseCard";

export default function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseSnap = await getDocs(collection(db, "courses"));
        const courseList = courseSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(courseList);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading)
    return <div className="text-white text-center mt-10">Loading courses...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Browse All Courses</h1>

        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                courseId={course.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
