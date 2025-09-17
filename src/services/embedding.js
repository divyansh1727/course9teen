import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Generate embeddings for a piece of text
export async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values; // array of floats
  } catch (err) {
    console.error("❌ Embedding error:", err);
    return [];
  }
}
