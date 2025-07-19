import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function AdminTestPage() {
  const { courseId, moduleIndex } = useParams();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [editId, setEditId] = useState(null);

  const handleOptionChange = (value, index) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setMessage("❗ Please fill all fields.");
      return;
    }

    setLoading(true);
    const testRef = collection(db, "tests", `${courseId}_${moduleIndex}`, "questions");

    try {
      // 1. Add test question
      await addDoc(testRef, {
        question,
        options,
        correctAnswer,
        courseId,
        moduleIndex: parseInt(moduleIndex),
        createdAt: serverTimestamp(),
      });

      // 2. Update course.modules[moduleIndex].hasTest = true
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        const modules = [...courseData.modules];

        if (!modules[parseInt(moduleIndex)].hasTest) {
          modules[parseInt(moduleIndex)].hasTest = true;

          await updateDoc(courseRef, {
            modules:modules
          });
        }
      }

      setMessage("✅ Test saved successfully!");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error saving test.");
    }

    setLoading(false);
  };

  const handleDelete = async (questionId) => {
    const ref = doc(db, "tests", `${courseId}_${moduleIndex}`, "questions", questionId);
    try {
      await deleteDoc(ref);
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  useEffect(() => {
    const qRef = collection(db, "tests", `${courseId}_${moduleIndex}`, "questions");

    const unsubscribe = onSnapshot(qRef, (snapshot) => {
      const questions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestionsList(questions);
    });

    return () => unsubscribe();
  }, [courseId, moduleIndex]);

  return (
    <div className="max-w-xl mx-auto mt-10 bg-gray-800 p-6 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Create Test for Module {moduleIndex}</h2>

      <label className="block mb-2 font-semibold">Question:</label>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full p-2 mb-4 rounded text-black"
      />

      <label className="block mb-2 font-semibold">Options:</label>
      {options.map((opt, idx) => (
        <input
          key={idx}
          type="text"
          value={opt}
          onChange={(e) => handleOptionChange(e.target.value, idx)}
          placeholder={`Option ${idx + 1}`}
          className="w-full p-2 mb-2 rounded text-black"
        />
      ))}

      <label className="block mb-2 font-semibold">Correct Answer (0–3):</label>
      <input
        type="number"
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(Number(e.target.value))}
        min={0}
        max={3}
        className="w-full p-2 mb-4 rounded text-black"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white w-full"
      >
        {loading ? "Saving..." : "Save Test"}
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}

      <hr className="my-6 border-gray-600" />

      <h3 className="text-xl font-semibold mb-4">Saved Questions</h3>
      {questionsList.length === 0 ? (
        <p className="text-gray-400">No questions added yet.</p>
      ) : (
        <ul className="space-y-4">
          {questionsList.map((q, idx) => (
            <li key={q.id} className="bg-gray-700 p-4 rounded">
              <p className="font-semibold">
                {idx + 1}. {q.question}
              </p>
              <ul className="pl-4 mt-2 space-y-1">
                {q.options.map((opt, i) => (
                  <li
                    key={i}
                    className={`${i === q.correctAnswer ? "text-green-400 font-bold" : ""}`}
                  >
                    {i + 1}. {opt}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setQuestion(q.question);
                  setOptions(q.options);
                  setCorrectAnswer(q.correctAnswer);
                  setEditId(q.id);
                  setMessage("📝 Editing selected question...");
                }}
                className="mt-2 mr-3 text-sm text-yellow-400 hover:underline"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(q.id)}
                className="mt-2 text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

