import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export const generateAIContent = createServerFn({ method: "POST" })
  .validator((data: { prompt: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Initialize the official Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: data.prompt,
      });
      
      return { 
        success: true, 
        text: response.text 
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate content from Gemini API");
    }
  });
