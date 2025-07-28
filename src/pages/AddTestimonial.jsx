// src/pages/AddTestimonial.jsx
import { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export default function AddTestimonial() {
  const [form, setForm] = useState({
    docId: "",
    name: "",
    courseName: "",
    review: "",
    rating: 5,
    photo: null,
  });

  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, photo: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccess("");

    try {
      let photoUrl = "";

      if (form.photo) {
        const imageRef = ref(storage, `testimonialPhotos/${uuidv4()}`);
        await uploadBytes(imageRef, form.photo);
        photoUrl = await getDownloadURL(imageRef);
      }

      const data = {
        name: form.name,
        courseName: form.courseName,
        review: form.review,
        rating: Number(form.rating),
        photoUrl,
      };

      // If docId is manually provided, use it, else auto-generate one
      if (form.docId.trim() !== "") {
        await setDoc(doc(db, "testimonials", form.docId), data);
      } else {
        await addDoc(collection(db, "testimonials"), data);
      }

      setSuccess("✅ Testimonial added successfully!");
      setForm({
        docId: "",
        name: "",
        courseName: "",
        review: "",
        rating: 5,
        photo: null,
      });
      setImagePreview(null);
    } catch (err) {
      console.error("Error adding testimonial:", err);
      alert("❌ Failed to add testimonial.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Add Testimonial</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="docId"
          placeholder="Optional Document ID (e.g. testimonial_ravi_001)"
          value={form.docId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="courseName"
          placeholder="Course Name"
          value={form.courseName}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="review"
          placeholder="Review"
          value={form.review}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <div className="flex items-center space-x-1">
  {[1, 2, 3, 4, 5].map((star) => (
    <span
      key={star}
      onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
      className={`cursor-pointer text-2xl ${
        star <= form.rating ? "text-yellow-400" : "text-gray-300"
      }`}
    >
      ★
    </span>
  ))}
  <span className="ml-2 text-sm text-gray-600">({form.rating} Star)</span>
</div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-40 object-cover rounded"
          />
        )}

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {uploading ? "Uploading..." : "Submit"}
        </button>

        {success && <p className="text-green-600 mt-2">{success}</p>}
      </form>
    </div>
  );
}
