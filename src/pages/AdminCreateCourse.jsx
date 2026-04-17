import { useState } from "react";
import { db } from "../firebase";
import { saveCourse } from "../services/saveCourse";
import { serverTimestamp } from "firebase/firestore";

export default function AdminCreateCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("free");

  const [modules, setModules] = useState([
    { title: "", videoUrl: "", resources: [{ label: "", url: "" }] },
  ]);

  const handleAddModule = () => {
    setModules([
      ...modules,
      { title: "", videoUrl: "", resources: [{ label: "", url: "" }] },
    ]);
  };

  const handleAddResource = (modIndex) => {
    const newModules = [...modules];
    newModules[modIndex].resources.push({ label: "", url: "" });
    setModules(newModules);
  };

  const handleCourseCreate = async () => {
    try {
      const courseId = Date.now().toString();

      await saveCourse(courseId, {
        title,
        description,
        instructor,
        modules,
        students: [],
        createdAt: serverTimestamp(),

        createdBy: "admin",
        isPublished: true,
        category: "General",

        // ✅ NEW
        priceType,
        price: priceType === "paid" ? Number(price) : 0,
      });

      alert("✅ Course created!");

      // 🔥 reset form
      setTitle("");
      setDescription("");
      setInstructor("");
      setPrice("");
      setPriceType("free");
      setModules([
        { title: "", videoUrl: "", resources: [{ label: "", url: "" }] },
      ]);

    } catch (err) {
      console.error(err);
      alert("❌ Error creating course");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Create New Course</h1>

      {/* BASIC INFO */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course Title"
        className="w-full p-2 mb-3 rounded bg-gray-800"
      />

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full p-2 mb-3 rounded bg-gray-800"
      />

      <input
        value={instructor}
        onChange={(e) => setInstructor(e.target.value)}
        placeholder="Instructor Name"
        className="w-full p-2 mb-4 rounded bg-gray-800"
      />

      {/* 💰 PRICE SECTION */}
      <div className="mb-4">
        <label className="mr-4">Course Type:</label>

        <select
          value={priceType}
          onChange={(e) => setPriceType(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {priceType === "paid" && (
        <input
          type="number"
          placeholder="Enter Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800"
        />
      )}

      {/* MODULES */}
      <h2 className="text-xl font-semibold mb-2">Modules</h2>

      {modules.map((mod, i) => (
        <div key={i} className="bg-gray-800 p-4 rounded mb-4">
          <input
            value={mod.title}
            onChange={(e) => {
              const newMods = [...modules];
              newMods[i].title = e.target.value;
              setModules(newMods);
            }}
            placeholder={`Module ${i + 1} Title`}
            className="w-full p-2 mb-2 rounded bg-gray-700"
          />

          <input
            value={mod.videoUrl}
            onChange={(e) => {
              const newMods = [...modules];
              newMods[i].videoUrl = e.target.value;
              setModules(newMods);
            }}
            placeholder="Video URL"
            className="w-full p-2 mb-2 rounded bg-gray-700"
          />

          <h3 className="text-sm mb-1">Resources:</h3>

          {mod.resources.map((r, j) => (
            <div key={j} className="flex gap-2 mb-1">
              <input
                value={r.label}
                onChange={(e) => {
                  const mods = [...modules];
                  mods[i].resources[j].label = e.target.value;
                  setModules(mods);
                }}
                placeholder="Label"
                className="flex-1 p-1 rounded bg-gray-700"
              />
              <input
                value={r.url}
                onChange={(e) => {
                  const mods = [...modules];
                  mods[i].resources[j].url = e.target.value;
                  setModules(mods);
                }}
                placeholder="URL"
                className="flex-1 p-1 rounded bg-gray-700"
              />
            </div>
          ))}

          <button
            onClick={() => handleAddResource(i)}
            className="text-sm text-blue-400 mt-2 underline"
          >
            ➕ Add Resource
          </button>
        </div>
      ))}

      <button
        onClick={handleAddModule}
        className="bg-blue-600 px-4 py-2 rounded mt-4"
      >
        ➕ Add Module
      </button>

      <button
        onClick={handleCourseCreate}
        className="bg-green-600 px-4 py-2 rounded mt-6 ml-4"
      >
        ✅ Create Course
      </button>
    </div>
  );
}