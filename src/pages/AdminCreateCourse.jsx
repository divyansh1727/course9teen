import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminCreateCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [modules, setModules] = useState([
    { title: "", videoUrl: "", resources: [{ label: "", url: "" }] },
  ]);

  const handleAddModule = () => {
    setModules([...modules, { title: "", videoUrl: "", resources: [{ label: "", url: "" }] }]);
  };

  const handleAddResource = (modIndex) => {
    const newModules = [...modules];
    newModules[modIndex].resources.push({ label: "", url: "" });
    setModules(newModules);
  };

  const handleCourseCreate = async () => {
    try {
      await addDoc(collection(db, "courses"), {
        title,
        description,
        instructor,
        modules,
        students: [],
        createdAt: serverTimestamp(),
      });
      alert("✅ Course created!");
      setTitle(""); setDescription(""); setInstructor("");
      setModules([{ title: "", videoUrl: "", resources: [{ label: "", url: "" }] }]);
    } catch (err) {
      console.error("❌ Failed to create course:", err);
      alert("Error creating course");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Create New Course</h1>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course Title"
        className="w-full p-2 mb-3 rounded bg-gray-800 text-white" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description"
        className="w-full p-2 mb-3 rounded bg-gray-800 text-white" />
      <input value={instructor} onChange={(e) => setInstructor(e.target.value)} placeholder="Instructor Name"
        className="w-full p-2 mb-6 rounded bg-gray-800 text-white" />

      <h2 className="text-xl font-semibold mb-2">Modules</h2>
      {modules.map((mod, i) => (
        <div key={i} className="bg-gray-800 p-4 rounded mb-4">
          <input value={mod.title} onChange={(e) => {
            const newMods = [...modules];
            newMods[i].title = e.target.value;
            setModules(newMods);
          }} placeholder={`Module ${i + 1} Title`} className="w-full p-2 mb-2 rounded bg-gray-700" />

          <input value={mod.videoUrl} onChange={(e) => {
            const newMods = [...modules];
            newMods[i].videoUrl = e.target.value;
            setModules(newMods);
          }} placeholder="Video URL (YouTube Embed)" className="w-full p-2 mb-2 rounded bg-gray-700" />

          <h3 className="text-sm mb-1">Resources:</h3>
          {mod.resources.map((r, j) => (
            <div key={j} className="flex gap-2 mb-1">
              <input value={r.label} onChange={(e) => {
                const mods = [...modules];
                mods[i].resources[j].label = e.target.value;
                setModules(mods);
              }} placeholder="Label" className="flex-1 p-1 rounded bg-gray-700" />
              <input value={r.url} onChange={(e) => {
                const mods = [...modules];
                mods[i].resources[j].url = e.target.value;
                setModules(mods);
              }} placeholder="URL" className="flex-1 p-1 rounded bg-gray-700" />
            </div>
          ))}
          <button onClick={() => handleAddResource(i)} className="text-sm text-blue-400 mt-2 underline">
            ➕ Add Resource
          </button>
        </div>
      ))}

      <button onClick={handleAddModule} className="bg-blue-600 px-4 py-2 rounded mt-4">
        ➕ Add Module
      </button>

      <button onClick={handleCourseCreate} className="bg-green-600 px-4 py-2 rounded mt-6 ml-4">
        ✅ Create Course
      </button>
    </div>
  );
}

