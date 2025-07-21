// src/modules/synthesize/index.js

/**
 * Synthesize: Generates a spoken response based on the interpreted intent.
 */
export const synthesize = (intent, voices) => {
  let reply = "I'm not sure how to handle that.";
  if (!intent || intent.error) {
    reply = "Sorry, I couldn't process that request.";
  } else {
    switch (intent.intent) {
      case "get_weather":
        reply = `Fetching the weather for you in ${intent.parameters.location}.`;
        break;
      case "set_timer":
        reply = `Setting a timer for ${intent.parameters.duration_minutes} minutes.`;
        break;
      default:
        reply =
          "I've understood your request, but I don't have a specific action for it.";
    }
  }

  const utterance = new SpeechSynthesisUtterance(reply);
  const femaleVoice =
    voices.find(
      (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")
    ) ||
    voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Google US English")
    );
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }
  window.speechSynthesis.speak(utterance);
  return reply; // Return the text that was spoken
};
