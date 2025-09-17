import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getEmbedding } from "./embedding";

export async function saveCourse(courseId, courseData) {
  try {
    // Create embedding from title + description
    const text = `${courseData.title} ${courseData.description}`;
    const embedding = await getEmbedding(text);

    await setDoc(doc(db, "courses", courseId), {
      ...courseData,
      embedding, // 🔥 stored in Firestore
    });

    console.log("✅ Course saved with embedding:", courseId);
  } catch (err) {
    console.error("❌ Failed to save course:", err);
  }
}
