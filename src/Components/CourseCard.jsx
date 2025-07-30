import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

export default function CourseCard({ course, courseId, isAdmin, onEditClick }) {
  const navigate = useNavigate();

  const handleCardClick = () => navigate(`/course/${courseId}`);
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEditClick();
  };

  return (
    <motion.div
      className="relative bg-black/70 hover:bg-black/80 text-white rounded-2xl p-4 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.6 }}
    >
      {/* ✏️ Admin Edit Button */}
      {isAdmin && (
        <button
          onClick={handleEditClick}
          className="absolute top-2 right-2 bg-yellow-300 hover:bg-yellow-400 text-black p-1 rounded-full"
          title="Edit Course"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* 💰 Free Badge */}
      {course.price === 0 && (
        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full z-10">
          Free
        </span>
      )}

      {/* 📷 Thumbnail */}
      {course.thumbnail && (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-40 object-cover rounded-lg mb-3 transition-transform duration-300 group-hover:scale-105"
        />
      )}

      {/* 📚 Title */}
      <h2 className="text-xl font-semibold mb-1">{course.title}</h2>

      {/* 📄 Description */}
      <p className="text-sm text-gray-300 mb-2 line-clamp-2">
        {course.description}
      </p>

      {/* 🔖 Category & Duration */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="bg-white/10 px-2 py-1 rounded-full">{course.category}</span>
        {course.duration && (
          <span className="bg-white/10 px-2 py-1 rounded-full">{course.duration}</span>
        )}
      </div>

      {/* 👨‍🏫 Instructor & 🎓 Students */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>👨‍🏫 {course.instructor || "Unknown"}</span>
        <span>🎓 {course.studentCount || 0} students</span>
      </div>

      {/* 💰 Price & ⭐️ Rating */}
      <div className="mt-2 flex justify-between items-center text-xs">
        {course.price === 0 ? (
          <span className="bg-green-700/30 text-green-400 px-2 py-1 rounded-full">
            Free
          </span>
        ) : (
          <span className="bg-yellow-700/30 text-yellow-400 px-2 py-1 rounded-full">
            ₹{course.price}
          </span>
        )}

        {/* ⭐️ Enhanced Rating Badge */}
        <div className="flex items-center gap-1 text-yellow-400 bg-white/5 px-2 py-1 rounded-full text-xs">
          <FaStar className="w-3 h-3" />
          <span>{course.rating || "4.5"}</span>
        </div>
      </div>
    </motion.div>
  );
}



