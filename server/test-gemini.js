const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    You are an expert grocery list parser. The user has provided a grocery list.
    Extract the items and their quantities. If a quantity isn't specified, default to 1.
    Return strictly a JSON array of objects with keys "item" (string) and "quantity" (number).
    Do not wrap it in markdown block quotes. Just the raw JSON array.

    List:
    add 2 apples and a milk
  `;

  try {
    const result = await model.generateContent(prompt);
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

testGemini();
