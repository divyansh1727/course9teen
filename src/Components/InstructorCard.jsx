import { FaChalkboardTeacher } from "react-icons/fa";

export default function InstructorCard({ instructor, courseCount, onClick }) {
  return (
    <div
      className="bg-gray-900 text-white p-4 rounded-xl shadow-md min-w-[220px] cursor-pointer hover:bg-gray-800 transition"
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        <img
          src={
            instructor.photoURL?.startsWith("http")
              ? instructor.photoURL
              : `/instructors/${instructor.photoURL || "default-instructor.png"}`
          }
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-instructor.png";
          }}
          alt={instructor.name}
          className="w-20 h-20 rounded-full mb-3 border border-yellow-400 object-cover"
        />

        <h3 className="text-lg font-semibold">{instructor.name}</h3>
        <p className="text-sm text-gray-400 mb-1">
          {instructor.bio || "Expert Instructor"}
        </p>

        <p className="text-sm text-blue-400">
          Category: {instructor.category || "N/A"}
        </p>

        <p className="text-yellow-300 text-sm mt-1">
          <FaChalkboardTeacher className="inline mr-1" />
          {courseCount} Courses
        </p>
      </div>
    </div>
  );
}

