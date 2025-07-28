import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminTestPage() {
  const { courseId, moduleIndex } = useParams();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null); // ✅ for edit mode

  const testRef = collection(db, "tests", `${courseId}_${moduleIndex}`, "questions");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const snap = await getDocs(testRef);
    const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setQuestions(list);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setMessage("❗ Please fill all fields.");
      return;
    }

    if (editingId) {
      // ✅ Update existing question
      await updateDoc(doc(testRef, editingId), {
        question,
        options,
        correctAnswer,
        updatedAt: serverTimestamp(),
      });
      setMessage("✅ Question updated.");
      setEditingId(null);
    } else {
      // ✅ Add new question
      await addDoc(testRef, {
        question,
        options,
        correctAnswer,
        courseId,
        moduleIndex: parseInt(moduleIndex),
        createdAt: serverTimestamp(),
      });
      setMessage("✅ Question added.");
    }

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    fetchQuestions();
  };

  const handleEdit = (q) => {
    setQuestion(q.question);
    setOptions(q.options);
    setCorrectAnswer(q.correctAnswer);
    setEditingId(q.id);
    setMessage("✏️ Editing mode. Make changes and press Update.");
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("⚠️ Are you sure you want to delete this question?");
    if (!confirm) return;

    await deleteDoc(doc(testRef, id));
    fetchQuestions();
    setMessage("🗑️ Question deleted.");
  };

  return (
    <div className="max-w-4xl mx-auto text-white p-6">
      <h2 className="text-2xl font-bold mb-4">Module {moduleIndex} - Test Editor</h2>

      <div className="bg-gray-800 p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">{editingId ? "Edit Question" : "Add New Question"}</h3>

        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question"
          className="w-full p-2 mb-3 bg-gray-900 border border-gray-700 rounded"
        />

        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            value={opt}
            onChange={(e) =>
              setOptions((prev) => {
                const copy = [...prev];
                copy[idx] = e.target.value;
                return copy;
              })
            }
            placeholder={`Option ${idx + 1}`}
            className="w-full p-2 mb-2 bg-gray-900 border border-gray-700 rounded"
          />
        ))}

        <div className="mb-3">
          <label className="text-sm">Correct Option Index (0-3):</label>
          <input
            type="number"
            min={0}
            max={3}
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(parseInt(e.target.value))}
            className="ml-2 w-16 p-1 bg-gray-900 border border-gray-700 rounded"
          />
        </div>

        <button
          onClick={handleSubmit}
          className={`${
            editingId ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
          } px-4 py-2 rounded`}
        >
          {editingId ? "✅ Update Question" : "➕ Add Question"}
        </button>

        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setQuestion("");
              setOptions(["", "", "", ""]);
              setCorrectAnswer(0);
              setMessage("❌ Edit cancelled.");
            }}
            className="ml-4 text-sm text-yellow-400 underline"
          >
            Cancel Edit
          </button>
        )}

        {message && <p className="mt-2 text-yellow-300">{message}</p>}
      </div>

      <h3 className="text-xl font-semibold mb-3">Existing Questions</h3>
      {loading ? (
        <p>Loading...</p>
      ) : questions.length === 0 ? (
        <p>No questions added yet.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q, i) => (
            <li key={q.id} className="bg-gray-900 p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <h4 className="font-bold">
                  Q{i + 1}: {q.question}
                </h4>
                <div className="space-x-3 text-sm">
                  <button
                    onClick={() => handleEdit(q)}
                    className="text-blue-400 hover:underline"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-red-400 hover:underline"
                  >
                    ❌ Delete
                  </button>
                </div>
              </div>
              <ul className="ml-4 mt-2 list-disc text-sm">
                {q.options.map((opt, idx) => (
                  <li
                    key={idx}
                    className={idx === q.correctAnswer ? "text-green-400 font-semibold" : ""}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
