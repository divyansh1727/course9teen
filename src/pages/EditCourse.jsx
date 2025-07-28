import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storage = getStorage();

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    price: "",
    thumbnail: "",
    published: false,
    category: "",
    duration: "",
  });

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [uploading, setUploading] = useState(false);

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
            category: data.category || "",
            duration: data.duration || "",
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `thumbnails/${id}-${file.name}`);
    setUploading(true);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, thumbnail: url }));
      alert("✅ Thumbnail uploaded!");
    } catch (err) {
      console.error("❌ Failed to upload image:", err);
      alert("Error uploading thumbnail.");
    } finally {
      setUploading(false);
    }
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
    return <div className="text-white text-center mt-10">Loading...</div>;

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
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category (e.g. Web Development)"
          className="w-full p-2 rounded bg-gray-800"
          required
        />
        <input
          name="duration"
          value={form.duration}
          onChange={handleChange}
          placeholder="Duration (e.g. 4 weeks)"
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        {/* ✅ Optional Manual Thumbnail URL */}
        <input
          name="thumbnail"
          value={form.thumbnail}
          onChange={handleChange}
          placeholder="Or paste Thumbnail URL"
          className="w-full p-2 rounded bg-gray-800"
        />

        {/* ✅ File Upload */}
        <div>
          <label className="block mb-1">Upload Thumbnail:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-gray-300"
          />
          {uploading && <p className="text-yellow-400 mt-1">Uploading...</p>}
        </div>

        {/* ✅ Thumbnail Preview */}
        {form.thumbnail && (
          <img
            src={form.thumbnail}
            alt="Thumbnail Preview"
            className="w-full h-48 object-cover rounded"
          />
        )}

        {/* ✅ Publish Toggle */}
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

      {/* 📚 Module List */}
      {course.modules.map((mod, index) => (
  <div
    key={index}
    className="bg-gray-800 p-4 rounded-lg mb-3 shadow-md"
  >
    <h4 className="font-semibold text-lg mb-1">
      Module {index + 1}: {mod.title}
    </h4>
    <p className="text-sm text-gray-300 mb-2">{mod.description}</p>

    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
      <Link
        to={`/admin/courses/${id}/module/${index}/test`}
        className="text-yellow-400 hover:underline text-sm"
      >
        ✏️ {mod.hasTest ? "Edit Test" : "Add Test"}
      </Link>

      {mod.hasTest ? (
        <Link
          to={`/admin/courses/${id}/module/${index}/progress`}
          className="text-blue-400 hover:underline text-sm"
        >
          📊 View Test Progress
        </Link>
      ) : (
        <span className="text-yellow-400 text-sm">No test added</span>
      )}
    </div>
  </div>
))}
</div>
  )}


