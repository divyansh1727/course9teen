import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AddInstructor() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    photoURL: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "instructors"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      alert("Instructor added!");
      navigate("/admin/instructors");
    } catch (err) {
      console.error("Add failed", err);
      alert("Failed to add.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-gray-800 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Add Instructor</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        className="w-full p-2 mb-2 rounded bg-gray-700"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full p-2 mb-2 rounded bg-gray-700"
        value={formData.email}
        onChange={handleChange}
      />
      <textarea
        name="bio"
        placeholder="Bio"
        className="w-full p-2 mb-2 rounded bg-gray-700"
        value={formData.bio}
        onChange={handleChange}
      />
      <input
        type="text"
        name="photoURL"
        placeholder="Photo URL"
        className="w-full p-2 mb-4 rounded bg-gray-700"
        value={formData.photoURL}
        onChange={handleChange}
      />
      <button type="submit" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded">Add</button>
    </form>
  );
}

