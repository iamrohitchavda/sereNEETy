import { GoogleGenerativeAI } from '@google/generative-ai';
import { stressTriggers, emotionalPatterns, copingStrategies, mindfulnessExercises, motivationalContent } from '../data/mockData';

// Initialize Gemini API
const getGeminiModel = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    return null;
  }
};

/**
 * Analyzes journal entry using Gemini AI, with a fallback to mock data.
 */
export const analyzeJournal = async ({ text, mood, stressLevel, exam }) => {
  const model = getGeminiModel();
  
  if (!model) {
    console.warn("No Gemini API Key found or initialization failed. Falling back to mock data.");
    return generateFallbackData(mood, stressLevel, exam);
  }

  const prompt = `
    You are an empathetic, always-available digital companion for students preparing for high-stakes board exams and competitive entrance tests (like ${exam.toUpperCase()}).
    The student is facing severe stress, burnout, and self-doubt.
    They wrote this journal entry: "${text}"
    Their self-reported mood score (1-5, where 1 is Terrible and 5 is Great): ${mood}
    Their self-reported stress level (0-10): ${stressLevel}

    Analyze this open-ended daily journaling and mood log. Uncover hidden stress triggers and emotional patterns that standard trackers miss. Provide hyper-personalized, contextual wellness support, real-time tailored coping strategies, adaptive mindfulness exercises, and motivational encouragement.

    Respond STRICTLY in JSON format matching this schema exactly:
    {
      "wellnessScore": number (0-100, calculate based on sentiment, mood, and stress),
      "analysis": {
        "stressTriggers": [
          { "trigger": string, "frequency": string, "severity": "high" | "medium" | "low", "insight": string, "icon": string }
        ],
        "emotionalPatterns": [
          { "day": string (current day), "moodScore": number, "stressLevel": number, "emotion": string }
        ],
        "copingStrategies": [
          {
            "category": string,
            "icon": string,
            "strategies": [
              { "title": string, "description": string, "duration": string, "difficulty": string }
            ]
          }
        ],
        "mindfulnessExercises": [
          { "title": string, "type": string, "duration": string, "instructions": [string] }
        ],
        "motivationalQuote": {
          "quote": string,
          "context": string
        }
      }
    }
    Make sure the response is valid JSON and nothing else (no markdown blocks around it if possible).
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean up potential markdown formatting from Gemini response
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleanedText);
    return data;
  } catch (error) {
    console.error("Gemini API call failed, falling back to mock data:", error);
    return generateFallbackData(mood, stressLevel, exam);
  }
};

/**
 * Fallback to mock data if AI fails or no API key is present
 */
function generateFallbackData(mood, stressLevel, exam) {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        wellnessScore: Math.round(((mood / 5) * 50) + ((10 - stressLevel) / 10 * 50)),
        analysis: {
          stressTriggers: stressTriggers.slice(0, 2),
          emotionalPatterns: emotionalPatterns.slice(0, 3),
          copingStrategies: copingStrategies.slice(0, 2),
          mindfulnessExercises: mindfulnessExercises.slice(0, 1),
          motivationalQuote: motivationalContent[exam]?.[0] || { quote: "Keep going!", context: "You got this." }
        }
      });
    }, 1500);
  });
}
