// src/modules/extract/index.js
import { callGeminiAPI } from "../../services/api";

/**
 * Extract: Sends an image to a multimodal LLM to extract structured data.
 */
export const extract = async (base64ImageData) => {
  const prompt = `You are an OCR and data extraction engine. Analyze the image and extract key information into a structured JSON object. Keys should be camelCase. Return ONLY the JSON object.`;
  const result = await callGeminiAPI(prompt, {
    data: base64ImageData,
    mimeType: "image/png",
  });
  const jsonString = result.match(/```json\n([\s\S]*?)\n```/)[1];
  const parsedJson = JSON.parse(jsonString);
  return parsedJson;
};
