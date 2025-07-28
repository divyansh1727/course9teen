import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function AddInstructor() {
  const [instructorId, setInstructorId] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddInstructor = async () => {
    if (!instructorId.trim()) {
      alert("Please enter a document ID for the instructor.");
      return;
    }

    setLoading(true);
    try {
      const instructorData = {
        name,
        bio,
        imageUrl,
        email,
        linkedIn,
        website,
        category,
        createdAt: serverTimestamp(), // optional timestamp
      };

      await setDoc(doc(db, "instructors", instructorId), instructorData);
      alert("Instructor added successfully!");

      // optional: clear form
      setInstructorId("");
      setName("");
      setBio("");
      setImageUrl("");
      setEmail("");
      setLinkedIn("");
      setWebsite("");
      setCategory("");
    } catch (error) {
      console.error("Error adding instructor:", error);
      alert("Failed to add instructor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4 bg-gray-900 text-white rounded-xl">
      <h2 className="text-xl font-semibold">Add Instructor</h2>

      <input
        type="text"
        placeholder="Document ID (e.g. instructor_dazz)"
        className="w-full p-2 rounded text-black"
        value={instructorId}
        onChange={(e) => setInstructorId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Name"
        className="w-full p-2 rounded text-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Bio"
        className="w-full p-2 rounded text-black"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <input
        type="text"
        placeholder="Image URL"
        className="w-full p-2 rounded text-black"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 rounded text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="LinkedIn URL"
        className="w-full p-2 rounded text-black"
        value={linkedIn}
        onChange={(e) => setLinkedIn(e.target.value)}
      />
      <input
        type="text"
        placeholder="Website"
        className="w-full p-2 rounded text-black"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />

      <input
        type="text"
        placeholder="Category (e.g. Programming, Design)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border px-3 py-2 w-full rounded text-black"
      />

      <button
        onClick={handleAddInstructor}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded font-semibold"
      >
        {loading ? "Adding..." : "Add Instructor"}
      </button>
    </div>
  );
}

