// src/modules/interpret/index.js
import { callGeminiAPI } from "../../services/api";

/**
 * Interpret: Sends text to an LLM to infer intent and parameters.
 */
export const interpret = async (text) => {
  const prompt = `You are an NLU (Natural Language Understanding) engine. Analyze the following text and return a JSON object with two keys: "intent" (a single snake_case string) and "parameters" (an object of key-value pairs).
    
    Examples:
    - Text: "What's the weather like in Paris?"
      JSON: {"intent": "get_weather", "parameters": {"location": "Paris"}}
    - Text: "Set a timer for 15 minutes"
      JSON: {"intent": "set_timer", "parameters": {"duration_minutes": 15}}

    Text to analyze: "${text}"
    
    Return ONLY the JSON object.`;

  const result = await callGeminiAPI(prompt);
  const jsonString = result.match(/```json\n([\s\S]*?)\n```/)[1];
  const parsedJson = JSON.parse(jsonString);
  return parsedJson;
};
