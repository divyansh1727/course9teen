// src/pages/EditCourse.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";


export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    price: "",
    thumbnail: "",
    published: false,
  });

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, "courses", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse(data);
          setForm({
            title: data.title || "",
            description: data.description || "",
            instructor: data.instructor || "",
            price: data.price || "",
            thumbnail: data.thumbnail || "",
            published: data.published || false,
          });
        } else {
          alert("Course not found.");
          navigate("/admin/manage-courses");
        }
      } catch (err) {
        console.error("❌ Failed to fetch course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, navigate]);



  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateDoc(doc(db, "courses", id), {
        ...form,
      });
      alert("✅ Course updated successfully!");
      navigate("/admin/manage-courses");
    } catch (err) {
      console.error("❌ Error updating course:", err);
      alert("Failed to update course.");
    }
  };

  if (loading)
    return (
      <div className="text-white text-center mt-10">Loading...</div>
    );

  return (
    <div className="text-white max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">✏️ Edit Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Course Title"
          className="w-full p-2 rounded bg-gray-800"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Course Description"
          className="w-full p-2 rounded bg-gray-800"
          required
        />
        <input
          name="instructor"
          value={form.instructor}
          onChange={handleChange}
          placeholder="Instructor Name"
          className="w-full p-2 rounded bg-gray-800"
          required
        />
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full p-2 rounded bg-gray-800"
          required
        />
        <input
          name="thumbnail"
          value={form.thumbnail}
          onChange={handleChange}
          placeholder="Thumbnail URL (optional)"
          className="w-full p-2 rounded bg-gray-800"
        />
        {form.thumbnail && (
  <img
    src={form.thumbnail}
    alt="Thumbnail Preview"
    className="w-full h-48 object-cover rounded"
  />
)}

<label className="flex items-center space-x-2">
  <input
    type="checkbox"
    name="published"
    checked={form.published}
    onChange={(e) =>
      setForm((prev) => ({ ...prev, published: e.target.checked }))
    }
    className="accent-blue-600"
  />
  <span>📢 Published</span>
</label>



        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          💾 Save Changes
        </button>
      </form>
       {course?.modules?.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-4">📚 Modules</h3>
          {course.modules.map((mod, index) => (
            <div
              key={index}
              className="bg-gray-800 p-4 rounded-lg mb-3 shadow-md"
            >
              <h4 className="font-semibold text-lg mb-1">
                Module {index + 1}: {mod.title}
              </h4>
              <p className="text-sm text-gray-300 mb-2">{mod.description}</p>
              {mod.hasTest ? (
                <Link
                  to={`/admin/courses/${id}/module/${index}/progress`}
                  className="text-blue-400 hover:underline"
                >
                  📊 View Test Progress
                </Link>
              ) : (
                <span className="text-yellow-400 text-sm">No test added</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
    

