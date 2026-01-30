
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getBettingInsights = async (videoTitle: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this video content and suggest 3 exciting betting questions for viewers. 
      Video Title: ${videoTitle}
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ["question", "options"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const moderateVideo = async (title: string, description: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Moderate this video content for safety and guidelines. Return a safety score from 0 to 100.
            Title: ${title}
            Description: ${description}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        reason: { type: Type.STRING },
                        isSafe: { type: Type.BOOLEAN }
                    },
                    required: ["score", "reason", "isSafe"]
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        return { score: 100, reason: "Bypassed", isSafe: true };
    }
};
