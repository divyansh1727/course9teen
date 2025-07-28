import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export default function EditTestimonial() {
  const { testimonialId } = useParams();
  const [form, setForm] = useState({
    name: "",
    courseName: "",
    review: "",
    rating: 5,
    photoUrl: "",
  });
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const snap = await getDoc(doc(db, "testimonials", testimonialId));
        if (snap.exists()) {
          setForm(snap.data());
        }
      } catch (err) {
        console.error("Error fetching testimonial:", err);
      }
    };

    fetchTestimonial();
  }, [testimonialId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatedData = { ...form };

      if (newImage) {
        const imgRef = ref(storage, `testimonialPhotos/${uuidv4()}`);
        await uploadBytes(imgRef, newImage);
        const newUrl = await getDownloadURL(imgRef);
        updatedData.photoUrl = newUrl;
      }

      await updateDoc(doc(db, "testimonials", testimonialId), updatedData);
      navigate("/admin/manage-testimonials");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update testimonial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Testimonial</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="courseName"
          placeholder="Course Name"
          value={form.courseName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="review"
          placeholder="Review"
          value={form.review}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
  name="rating"
  value={form.rating}
  onChange={handleChange}
  className="w-full p-2 border rounded"
>
  <option value={1}>⭐ 1</option>
  <option value={2}>⭐⭐ 2</option>
  <option value={3}>⭐⭐⭐ 3</option>
  <option value={4}>⭐⭐⭐⭐ 4</option>
  <option value={5}>⭐⭐⭐⭐⭐ 5</option>
</select>

{form.photoUrl && (
  <img
    src={form.photoUrl}
    alt="Current"
    className="h-32 object-cover rounded border mb-2"
  />
)}


        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Update Testimonial"}
        </button>
      </form>
    </div>
  );
}
