// src/pages/AdminInstructors.jsx

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "instructors"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInstructors(data);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    };

    fetchInstructors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this instructor?")) return;
    try {
      await deleteDoc(doc(db, "instructors", id));
      setInstructors(prev => prev.filter(instructor => instructor.id !== id));
    } catch (error) {
      console.error("Error deleting instructor:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Instructors</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => navigate("/admin/add-instructor")}
        >
          <FaPlus /> Add Instructor
        </button>
      </div>

      {instructors.length === 0 ? (
        <p className="text-white">No instructors found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-zinc-800 p-4 rounded-lg shadow text-white">
              <h3 className="text-xl font-semibold mb-1">{instructor.name}</h3>
              <p className="text-sm text-gray-300 mb-2">{instructor.email}</p>
              {instructor.photoURL && (
                <img
                  src={instructor.photoURL}
                  alt={instructor.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => navigate(`/admin/edit-instructor/${instructor.id}`)}
                  className="text-yellow-400 hover:text-yellow-500"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(instructor.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

