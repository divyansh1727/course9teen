import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

export default function StudentQuizPage() {
  const { courseId, moduleIndex } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = collection(db, "tests", `${courseId}_${moduleIndex}`, "questions");
        const snap = await getDocs(ref);
        const qList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setQuestions(qList);

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        setUser(currentUser);

        const attemptsQuery = query(
          collection(db, "testAttempts"),
          where("userId", "==", currentUser.uid),
          where("courseId", "==", courseId),
          where("moduleIndex", "==", parseInt(moduleIndex))
        );

        const attemptsSnap = await getDocs(attemptsQuery);
        const attemptList = attemptsSnap.docs.map((doc) => doc.data());

        setAttempts(attemptList);
        if (attemptList.length >= 3) {
          setSubmitted(true); // Block quiz if 3 attempts already
        }
      } catch (err) {
        console.error("Error loading quiz or attempts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleIndex]);

  const handleOptionChange = (questionId, selectedIndex) => {
    if (!submitted) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: selectedIndex,
      }));
    }
  };

  const handleSubmit = async () => {
    if (attempts.length >= 3) {
      alert("❌ You have already attempted this test 3 times.");
      return;
    }

    const allAnswered = questions.every((q) => answers[q.id] !== undefined);
    if (!allAnswered) {
      alert("⚠️ Please answer all questions before submitting.");
      return;
    }

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });

    const attemptNumber = attempts.length + 1;
    const attemptId = `${user.uid}_${courseId}_${moduleIndex}_${attemptNumber}`;

    await setDoc(doc(db, "testAttempts", attemptId), {
      userId: user.uid,
      courseId,
      moduleIndex: parseInt(moduleIndex),
      attemptNumber,
      score: correct,
      total: questions.length,
      answers,
      submittedAt: serverTimestamp(),
    });

    setScore(correct);
    setSubmitted(true);
    alert(`✅ Attempt ${attemptNumber} submitted!`);
  };

  if (loading) {
    return <div className="text-white text-center mt-10">Loading quiz...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white bg-gray-900 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-6">Module {moduleIndex} Quiz</h2>

      {submitted && attempts.length >= 3 && (
        <div className="mb-4 text-red-400 font-semibold text-center">
          🚫 You've reached the maximum of 3 attempts.
        </div>
      )}

      {!submitted && (
        <div className="mb-4 text-yellow-300 font-medium text-center">
          Attempt {attempts.length + 1} of 3
        </div>
      )}

      {questions.map((q, index) => (
        <div key={q.id} className="mb-6 bg-gray-800 p-4 rounded">
          <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
          {q.options.map((opt, i) => {
            const isSelected = answers[q.id] === i;
            const isCorrect = q.correctAnswer === i;
            const showCorrect = submitted && isSelected && isCorrect;
            const showIncorrect = submitted && isSelected && !isCorrect;
            const showMissedCorrect = submitted && !isSelected && isCorrect;

            return (
              <label
                key={i}
                className={`block mb-1 px-2 py-1 rounded ${
                  showCorrect
                    ? "bg-green-600"
                    : showIncorrect
                    ? "bg-red-600"
                    : showMissedCorrect
                    ? "border border-green-500"
                    : "bg-transparent"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={i}
                  checked={isSelected}
                  onChange={() => handleOptionChange(q.id, i)}
                  disabled={submitted}
                  className="mr-2"
                />
                {opt}
              </label>
            );
          })}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
        >
          Submit Quiz
        </button>
      )}

      {submitted && score !== null && (
        <p className="mt-6 text-xl font-semibold text-center text-green-400">
          ✅ You scored {score} out of {questions.length}
        </p>
      )}
    </div>
  );
}


