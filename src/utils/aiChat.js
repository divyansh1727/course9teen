import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");

export async function askCourseAI(question, course) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const courseContent = course.modules
    ?.map((m) => m.title)
    .join("\n");

  const prompt = `
You are a helpful course assistant.

Course Title: ${course.title}
Course Description: ${course.description}
Modules: ${courseContent}

Student Question:
${question}

Answer clearly and simply:
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}