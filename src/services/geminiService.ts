import { GoogleGenAI, Type } from "@google/genai";
import { Interaction, UXInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateUXInsights(interactions: Interaction[]): Promise<UXInsight[]> {
  if (interactions.length === 0) return [];

  // Filter for problematic interactions
  const problems = interactions.filter(i => ['rage_click', 'hesitation', 'dead_click'].includes(i.type));
  
  if (problems.length === 0) return [];

  const prompt = `
    Analyze the following user behavior data from an e-commerce site and identify UX friction points.
    Data: ${JSON.stringify(problems.slice(-20))}
    
    CRITICAL: Use a warm, intelligent, and conversational tone. Avoid robotic or purely technical descriptions.
    Example: Instead of "Size issue detected", use "Users seem unsure about sizing and are repeatedly checking options."
    
    For each issue, provide:
    1. A clear, natural language issue title.
    2. Severity (low, medium, high).
    3. A human-friendly, warm description of what happened.
    4. A specific, actionable suggestion to fix it.
    5. The elementId associated with the issue.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              issue: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
              description: { type: Type.STRING },
              suggestion: { type: Type.STRING },
              elementId: { type: Type.STRING },
            },
            required: ["issue", "severity", "description", "suggestion", "elementId"],
          },
        },
      },
    });

    const insights = JSON.parse(response.text || "[]");
    return insights.map((insight: any) => ({
      ...insight,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error("Failed to generate insights", error);
    return [];
  }
}
