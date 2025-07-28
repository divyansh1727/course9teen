import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ManageInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [extraInstructors, setExtraInstructors] = useState([]);
  const navigate = useNavigate();

  // Fetch instructors from instructors collection
  const fetchInstructors = async () => {
    const querySnapshot = await getDocs(collection(db, "instructors"));
    const instructorList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    instructorList.sort((a, b) => a.name.localeCompare(b.name));
    setInstructors(instructorList);
    return instructorList;
  };
  


  // Fetch instructors used in courses but not added as separate instructors
  const fetchInstructorsFromCourses = async (existingInstructorIds) => {
    const courseSnapshot = await getDocs(collection(db, "courses"));
    const tempMap = {};

    courseSnapshot.forEach((doc) => {
      const course = doc.data();
      const instructorId = course.instructorId || course.instructor;
      const instructorName = course.instructorName || instructorId;

      if (
        instructorId &&
        !existingInstructorIds.includes(instructorId) &&
        !tempMap[instructorId]
      ) {
        tempMap[instructorId] = {
          id: instructorId,
          name: instructorName || instructorId,
        };
      }
    });

    const extraList = Object.values(tempMap);
    setExtraInstructors(extraList);
  };

  useEffect(() => {
    const init = async () => {
      const existing = await fetchInstructors();
      const existingIds = existing.map((inst) => inst.id);
      await fetchInstructorsFromCourses(existingIds);
    };
    init();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this instructor?")) {
      await deleteDoc(doc(db, "instructors", id));
      const existing = await fetchInstructors();
      const existingIds = existing.map((inst) => inst.id);
      await fetchInstructorsFromCourses(existingIds);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Instructors</h2>
        <button
          onClick={() => navigate("/admin/add-instructor")}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md"
        >
          ➕ Add Instructor
        </button>
      </div>

      {instructors.length === 0 && extraInstructors.length === 0 ? (
        <p className="text-white">No instructors found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="bg-gray-800 p-4 rounded-md shadow-md text-white"
              >
                <div className="flex items-center gap-4 mb-2">
  <img
    src={instructor.photoURL || "/default-avatar.png"}
    alt={instructor.name}
    className="w-16 h-16 rounded-full object-cover"
  />
  <div>
    <h3 className="text-xl font-semibold">{instructor.name}</h3>
    <p className="text-gray-300 text-sm">{instructor.email}</p>
  </div>
</div>
<p className="text-gray-300 text-sm">{instructor.bio}</p>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/edit-instructor/${instructor.id}`)
                    }
                    className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(instructor.id)}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {extraInstructors.length > 0 && (
            <>
              <h3 className="text-xl text-white font-semibold mb-2">
                Instructors used in courses (but not created yet)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extraInstructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="bg-gray-700 p-4 rounded-md shadow text-white"
                  >
                    <h4 className="text-lg font-medium">
                      {instructor.name || instructor.id}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2">
                      ID: {instructor.id}
                    </p>
                    <button
                      onClick={() =>
                        navigate("/admin/add-instructor", {
                          state: { prefillId: instructor.id, prefillName: instructor.name },
                        })
                      }
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded"
                    >
                      ➕ Create Instructor
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}


