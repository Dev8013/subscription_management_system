
import { GoogleGenAI, Type } from "@google/genai";
import { Subscription } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export async function parseSmartInput(input: string): Promise<Partial<Subscription>> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse this subscription description into a JSON object: "${input}". 
    The JSON should include fields like "name", "price", "billingCycle" (monthly, yearly, weekly), "currency", "category". 
    If you can't find a field, leave it null.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.NUMBER },
          billingCycle: { type: Type.STRING },
          currency: { type: Type.STRING },
          category: { type: Type.STRING },
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {};
  }
}

export async function draftReminderEmail(sub: Subscription): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional and friendly email notification for a user whose subscription to "${sub.name}" is expiring on ${new Date(sub.endDate).toLocaleDateString()}. 
    The price is ${sub.price} ${sub.currency}. Remind them to renew to avoid service interruption.`,
  });

  return response.text || "Failed to generate reminder email.";
}
