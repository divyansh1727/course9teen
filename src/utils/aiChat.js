// utils/aiChat.js

export async function askCourseAI(question, course) {
  const q = question.toLowerCase();

  let response = "";

  if (q.includes("explain")) {
    response = `This course "${course.title}" teaches you about ${course.description}. It is structured into modules to help you learn step by step.`;
  } 
  else if (q.includes("summary")) {
    response = `Summary: This course covers key concepts across ${course.modules.length} modules designed for progressive learning.`;
  } 
  else if (q.includes("modules")) {
    response =
      `This course has ${course.modules.length} modules:\n` +
      course.modules.map((m, i) => `${i + 1}. ${m.title}`).join("\n");
  } 
  else {
    response =
      "This course helps you learn step-by-step with structured modules and practical content.";
  }

  // simulate AI delay
  await new Promise((res) => setTimeout(res, 800));

  return response;
}