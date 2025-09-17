import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getEmbedding } from "./embedding";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Cosine similarity function
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((acc, v, i) => acc + v * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, v) => acc + v * v, 0));
  const normB = Math.sqrt(vecB.reduce((acc, v) => acc + v * v, 0));
  return dot / (normA * normB);
}

export async function askRAGGemini(userPrompt) {
  try {
    // 1️⃣ Embed the user question
    const queryEmbedding = await getEmbedding(userPrompt);

    // 2️⃣ Fetch courses
    const snapshot = await getDocs(collection(db, "courses"));
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3️⃣ Rank by similarity
    const ranked = courses
      .map(course => ({
        ...course,
        score: course.embedding
          ? cosineSimilarity(queryEmbedding, course.embedding)
          : -1,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3

    // 4️⃣ Build context
    const context = ranked.map(c => 
      `- ${c.title} (${c.duration || "N/A"}): ${c.description} [Price: ${c.price || "Free"}]`
    ).join("\n");

    const contextPrompt = `
You are an AI assistant for a course platform.
User asked: "${userPrompt}"

Here are the most relevant courses:
${context}

👉 Rules for your reply:
- If question is about courses → reply using only this list.
- If general → answer normally.
- Be friendly, concise, and human-like.
`;

    // 5️⃣ Ask Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(contextPrompt);

    return result.response.text();
  } catch (error) {
    console.error("❌ RAG Gemini Error:", error);
    return "Sorry, something went wrong.";
  }
}
