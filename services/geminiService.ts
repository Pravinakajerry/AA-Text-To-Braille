
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateToBraille = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  // To resolve the 500 error, we are simplifying the request.
  // Instead of using systemInstruction, we combine the instructions and the user's text
  // into a single, direct prompt. This is a more robust method that is less likely
  // to be misinterpreted by the API backend.
  const prompt = `Translate the following English text to Grade 1 Braille.
Respond ONLY with the Braille Unicode characters. Do not include any other text, explanations, or formatting.
English text: "${text}"
Braille translation:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      // The config object containing systemInstruction has been removed to simplify the request.
    });
    
    // The response.text getter is the correct way to get the string output.
    const cleanText = response.text.trim();

    return cleanText;
  } catch (error) {
    // Log the full error to the console for better debugging.
    console.error("Error calling Gemini API:", JSON.stringify(error, null, 2));
    throw new Error("The AI service failed to process the translation request.");
  }
};
