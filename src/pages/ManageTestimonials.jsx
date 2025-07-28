// src/pages/ManageTestimonials.jsx
import { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useNavigate } from "react-router-dom";

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const navigate = useNavigate();

  // Real-time fetch
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "testimonials"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTestimonials(list);
    });

    return () => unsubscribe();
  }, []);

  // Delete function
  const handleDelete = async (id, imageUrl) => {
    const confirm = window.confirm("Are you sure you want to delete this testimonial?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "testimonials", id));

      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }

      // No need to manually update UI, onSnapshot handles it
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🧾 Manage Testimonials</h2>
        <button
          onClick={() => navigate("/admin/add-testimonial")}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md"
        >
          ➕ Add Testimonial
        </button>
      </div>

      {testimonials.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No testimonials found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-center text-center"
            >
              {t.photoUrl && (
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-white"
                />
              )}
              <h3 className="text-xl font-semibold mb-1">{t.name}</h3>
              <p className="text-sm text-gray-300 mb-2">{t.designation}</p>
              <p className="text-gray-200 text-sm italic">"{t.testimonial}"</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate(`/admin/edit-testimonial/${t.id}`)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded-md"
                >
                  ✏️ Edit
                </button>

              <button
                onClick={() => handleDelete(t.id, t.photoUrl)}
                className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-1 rounded-md"
              >
                ❌ Delete
              </button>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
