
import { GoogleGenAI, Type } from "@google/genai";
import { Subscription, Insight } from "../types";

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

export async function getSavingsInsights(subs: Subscription[]): Promise<Insight[]> {
  if (subs.length === 0) return [];
  const ai = getGeminiClient();
  const subData = subs.map(s => `${s.name} (${s.price} ${s.currency} / ${s.billingCycle} - Category: ${s.category})`).join(', ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these subscriptions for potential savings or overlaps: ${subData}. 
    Provide 3 actionable insights in JSON format. 
    Each insight must have a "title", "description", "impact" (low, medium, high), and "potentialSavings" (number).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING },
            potentialSavings: { type: Type.NUMBER },
          },
          required: ["title", "description", "impact", "potentialSavings"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Insights", e);
    return [];
  }
}

export async function draftReminderEmail(sub: Subscription): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional and friendly email notification for a user whose subscription to "${sub.name}" is expiring on ${new Date(sub.endDate).toLocaleDateString()}. 
    The price is ${sub.price} ${sub.currency}. Remind them to renew to avoid service interruption. 
    Subject: Action Required: Your ${sub.name} Subscription is Due Soon`,
  });

  return response.text || "Failed to generate reminder email.";
}

export async function draftUpcomingDuesSummary(subs: Subscription[]): Promise<string> {
  const expiringSubs = subs.filter(s => s.status === 'expiring');
  if (expiringSubs.length === 0) return "No immediate dues found.";

  const ai = getGeminiClient();
  const subList = expiringSubs.map(s => `- ${s.name}: ${s.price} ${s.currency} (Due: ${new Date(s.endDate).toLocaleDateString()})`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a personal financial assistant. Write a summary email for the user highlighting their earliest upcoming dues:
    ${subList}
    
    The tone should be helpful and organized. Categorize them and suggest which ones are high priority.
    Subject: Summary: Upcoming Subscription Renewals for ${new Date().toLocaleDateString()}`,
  });

  return response.text || "Failed to generate summary email.";
}
