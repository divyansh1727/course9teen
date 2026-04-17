import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getEmbedding } from "./embedding";

export async function saveCourse(courseId, courseData) {
  try {
    await setDoc(doc(db, "courses", courseId), {
      ...courseData,
    });

    console.log("✅ Course saved:", courseId);
  } catch (err) {
    console.error("❌ Failed to save course:", err);
  }
}
