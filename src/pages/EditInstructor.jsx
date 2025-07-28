import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EditInstructor() {
  const { id } = useParams(); // get from route param
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const docRef = doc(db, "instructors", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setFormData(snap.data());
        } else {
          alert("Instructor not found.");
          navigate("/admin/instructors");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Error loading instructor.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "instructors", id), formData);
      alert("Instructor updated!");
      navigate("/admin/instructors");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-gray-800 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Instructor</h2>
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
      <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded">Update</button>
    </form>
  );
}

