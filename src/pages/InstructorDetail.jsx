import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CourseCard from "../Components/CourseCard";

export default function InstructorDetail() {
  const { instructorId } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const userRef = doc(db, "instructors", instructorId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setInstructor(userData);

          const q = query(
            collection(db, "courses"),
            where("createdBy", "==", instructorId)
          );
          const courseSnap = await getDocs(q);

          const courseList = [];
          let enrollCount = 0;
          courseSnap.forEach((doc) => {
            const courseData = { id: doc.id, ...doc.data() };
            courseList.push(courseData);
            enrollCount += courseData.enrolledCount || 0;
          });

          setCourses(courseList);
          setTotalEnrollments(enrollCount);
        }
      } catch (error) {
        console.error("Error fetching instructor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [instructorId]);

  if (loading) return <div className="text-center text-white py-10">Loading instructor info...</div>;
  if (!instructor) return <div className="text-center text-white py-10">Instructor not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      {/* Instructor Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
        <img
  src={instructor.photoURL ? `/instructors/${instructor.photoURL}` : "/default-avatar.png"}
  onError={(e) => {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = "/default-avatar.png";
  }}
  alt="Instructor"
  className="w-28 h-28 rounded-full object-cover border-2 border-yellow-400"
/>
        <div>
          <h1 className="text-3xl font-bold">{instructor.name}</h1>
          <p className="text-sm text-gray-400">{instructor.email}</p>
          {instructor.location && <p className="text-sm mt-1 text-gray-400">📍 {instructor.location}</p>}
          <p className="mt-2 text-gray-300">{instructor.bio || "No bio available."}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-10">
        <div className="bg-gray-800 p-4 rounded-lg text-center w-32">
          <p className="text-xl font-semibold">{courses.length}</p>
          <p className="text-sm text-gray-400">Courses</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center w-32">
          <p className="text-xl font-semibold">{totalEnrollments}</p>
          <p className="text-sm text-gray-400">Students</p>
        </div>
      </div>

      {/* Courses List */}
      <h2 className="text-2xl font-semibold mb-4">Courses by {instructor.name}</h2>
      {courses.length === 0 ? (
        <p className="text-gray-400">This instructor hasn’t published any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
