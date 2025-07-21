// src/services/api.js

/**
 * Gemini API Caller: A centralized function to interact with the generative model.
 */
export const callGeminiAPI = async (
  prompt,
  imageData = null,
  audioData = null
) => {
  const apiKey = "AIzaSyBWoROUVSEGMZ_abgYsnMLmaWLdnVfp9z0"; //api key
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  let parts = [{ text: prompt }];
  if (imageData)
    parts.push({
      inlineData: { mimeType: imageData.mimeType, data: imageData.data },
    });
  if (audioData)
    parts.push({
      inlineData: { mimeType: audioData.mimeType, data: audioData.data },
    });

  const payload = { contents: [{ role: "user", parts: parts }] };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API Error Response:", errorBody);
    throw new Error(`API call failed with status: ${response.status}`);
  }

  const result = await response.json();
  if (result.candidates && result.candidates.length > 0) {
    return result.candidates[0].content.parts[0].text;
  } else {
    console.error("Invalid response from API:", result);
    if (result.promptFeedback)
      throw new Error(
        `Request blocked. Reason: ${result.promptFeedback.blockReason}`
      );
    throw new Error("Invalid response structure from API.");
  }
};
