import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminTestProgressPage() {
  const { courseId, moduleIndex } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      const q = query(
        collection(db, "testAttempts"),
        where("courseId", "==", courseId),
        where("moduleIndex", "==", parseInt(moduleIndex))
      );
      const snap = await getDocs(q);
      const data = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const userRef = doc(db, "users", data.userId);
          const userSnap = await getDoc(userRef);
          const userInfo = userSnap.exists() ? userSnap.data() : {};
          return {
            ...data,
            name: userInfo.name || "Unknown",
            email: userInfo.email || "Unknown"
          };
        })
      );
      setAttempts(data);
      setLoading(false);
    };

    fetchAttempts();
  }, [courseId, moduleIndex]);

  if (loading) return <div className="text-white text-center mt-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto text-white p-6">
      <h2 className="text-2xl font-bold mb-6">Student Attempts for Module {moduleIndex}</h2>

      {attempts.length === 0 ? (
        <p>No attempts found for this test.</p>
      ) : (
        <table className="w-full table-auto border border-white">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Attempt #</th>
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a, idx) => (
              <tr key={idx} className="bg-gray-800 text-center">
                <td className="p-2 border">{a.name}</td>
                <td className="p-2 border">{a.email}</td>
                <td className="p-2 border">{a.attemptNumber}</td>
                <td className="p-2 border">{a.score}</td>
                <td className="p-2 border">{a.total}</td>
                <td className="p-2 border">
                  {a.submittedAt?.toDate?.().toLocaleString() || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
