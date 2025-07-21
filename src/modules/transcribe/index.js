// src/modules/transcribe/index.js
import { callGeminiAPI } from "../../services/api";

/**
 * Transcribe File: Sends an audio file to the Gemini API for transcription.
 */
export const transcribeFile = async (base64AudioData, mimeType) => {
  const prompt = "Transcribe this audio file accurately.";
  const result = await callGeminiAPI(prompt, null, {
    data: base64AudioData,
    mimeType,
  });
  return result;
};
