import React, { useState, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Mic,
  FileText,
  Bot,
  Volume2,
  Loader2,
  FileAudio,
} from "lucide-react";

// Import reusable UI components
import Card from "./components/Card";
import Title from "./components/Title";
import ResultBlock from "./components/ResultBlock";

// Import the core logic modules
import { transcribeFile } from "./modules/transcribe";
import { interpret } from "./modules/interpret";
import { synthesize } from "./modules/synthesize";
import { extract } from "./modules/extract";

// --- Main App Component (Orchestrator) ---

export default function App() {
  // --- State Management ---
  const [inputFile, setInputFile] = useState(null);
  const [pipelineType, setPipelineType] = useState(null); // 'audio', 'image', or 'live_audio'

  // Pipeline State
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState(null);
  const [intentData, setIntentData] = useState(null);
  const [synthesizedText, setSynthesizedText] = useState(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  // Loading State
  const [loadingStates, setLoadingStates] = useState({
    transcribing: false,
    interpreting: false,
    extracting: false,
  });

  // Web Speech API instances
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [voices, setVoices] = useState([]);

  // --- Lifecycle Hook for Initializing APIs ---

  useEffect(() => {
    // Initialize live speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;
      setSpeechRecognition(recognition);
    } else {
      console.warn("Speech Recognition not supported in this browser.");
    }

    // Load synthesis voices
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    // Voices load asynchronously. We must listen for the 'voiceschanged' event.
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Initial call in case they are already loaded.
  }, []);

  // --- Pipeline Orchestration ---

  const runFullAudioPipeline = async (transcript) => {
    if (!transcript || transcript.startsWith("Error:")) {
      setLoadingStates({
        transcribing: false,
        interpreting: false,
        extracting: false,
      });
      return;
    }
    try {
      setLoadingStates((s) => ({
        ...s,
        transcribing: false,
        interpreting: true,
      }));
      const intent = await interpret(transcript);
      setIntentData(intent);

      const reply = synthesize(intent, voices);
      setSynthesizedText(reply);
    } catch (error) {
      console.error("Interpretation/Synthesis pipeline error:", error);
      setIntentData({ error: "Failed to interpret text." });
      const reply = synthesize({ error: "Failed to interpret text." }, voices);
      setSynthesizedText(reply);
    } finally {
      setLoadingStates((s) => ({ ...s, interpreting: false }));
    }
  };

  // --- UI Handlers ---

  const resetState = () => {
    setInputFile(null);
    setPipelineType(null);
    setTranscribedText(null);
    setIntentData(null);
    setSynthesizedText(null);
    setImageDataUrl(null);
    setExtractedData(null);
    setIsListening(false);
    setLoadingStates({
      transcribing: false,
      interpreting: false,
      extracting: false,
    });
  };

  const handleFileChange = (e) => {
    resetState();
    const file = e.target.files[0];
    if (!file) return;

    setInputFile(file);
    const fileType = file.type;
    const reader = new FileReader();

    if (fileType.startsWith("audio/")) {
      setPipelineType("audio");
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1];
        setLoadingStates((s) => ({ ...s, transcribing: true }));
        try {
          const transcript = await transcribeFile(base64String, fileType);
          setTranscribedText(transcript);
          runFullAudioPipeline(transcript);
        } catch (error) {
          console.error("Transcription error:", error);
          setTranscribedText("Error: Could not transcribe audio.");
          setLoadingStates((s) => ({ ...s, transcribing: false }));
        }
      };
      reader.readAsDataURL(file);
    } else if (fileType.startsWith("image/")) {
      setPipelineType("image");
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1];
        setImageDataUrl(reader.result);
        setLoadingStates((s) => ({ ...s, extracting: true }));
        try {
          const data = await extract(base64String);
          setExtractedData(data);
        } catch (error) {
          console.error("Extraction error:", error);
          setExtractedData({ error: "Failed to extract data from image." });
        } finally {
          setLoadingStates((s) => ({ ...s, extracting: false }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPipelineType("unsupported");
    }
  };

  const handleRecordAudioClick = () => {
    resetState();
    setPipelineType("live_audio");
  };

  const transcribeLive = useCallback(() => {
    if (isListening || !speechRecognition) return;

    setLoadingStates((s) => ({
      ...s,
      transcribing: true,
      interpreting: false,
    }));
    setTranscribedText(null);
    setIntentData(null);
    setSynthesizedText(null);
    setIsListening(true);

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
      runFullAudioPipeline(transcript);
    };

    speechRecognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setTranscribedText("Error: Speech recognition failed.");
      setLoadingStates((s) => ({ ...s, transcribing: false }));
    };

    speechRecognition.onend = () => {
      setIsListening(false);
      //  transcribing state is turned off in runFullAudioPipeline
    };

    speechRecognition.start();
  }, [isListening, speechRecognition, voices]);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-cyan-400");
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDragEnter = (e) =>
    e.currentTarget.classList.add("border-cyan-400");
  const handleDragLeave = (e) =>
    e.currentTarget.classList.remove("border-cyan-400");

  // --- Render Method ---

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
            Modular Media & Data Pipeline
          </h1>
          <p className="text-slate-400 mt-2">
            Process audio files, live recordings, and images.
          </p>
        </header>

        <main>
          <Card>
            <Title
              icon={<UploadCloud className="w-6 h-6 text-cyan-300" />}
              text="1. Choose Input Method"
            />
            <div className="grid md:grid-cols-2 gap-6">
              {/* File Upload Option */}
              <div
                className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer transition-colors duration-300 hover:border-cyan-500 bg-slate-800/20 flex flex-col items-center justify-center h-48"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="audio/wav, audio/mp3, audio/mpeg, image/png, image/jpeg"
                />
                <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-slate-300 font-semibold">Upload a File</p>
                <p className="text-xs text-slate-500 mt-1">
                  Drag & drop or click
                </p>
                {inputFile && (
                  <p className="mt-2 text-cyan-300 font-mono text-sm truncate w-full">
                    {inputFile.name}
                  </p>
                )}
              </div>

              {/* Record Audio Option */}
              <div
                className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer transition-colors duration-300 hover:border-cyan-500 bg-slate-800/20 flex flex-col items-center justify-center h-48"
                onClick={handleRecordAudioClick}
              >
                <Mic className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-slate-300 font-semibold">Record Audio</p>
                <p className="text-xs text-slate-500 mt-1">
                  Use your microphone
                </p>
              </div>
            </div>
          </Card>

          {(pipelineType === "audio" || pipelineType === "live_audio") && (
            <Card className="mt-6">
              <Title
                icon={<FileAudio className="w-6 h-6 text-cyan-300" />}
                text="2. Audio Processing Pipeline"
              />
              <div className="space-y-4">
                {pipelineType === "live_audio" && (
                  <button
                    onClick={transcribeLive}
                    disabled={isListening || loadingStates.transcribing}
                    className="w-full flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform active:scale-95"
                  >
                    {isListening || loadingStates.transcribing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Click to Speak</span>
                      </>
                    )}
                  </button>
                )}

                <ResultBlock
                  title="Step A: Transcribe"
                  isLoading={loadingStates.transcribing}
                >
                  {transcribedText ? (
                    `"${transcribedText}"`
                  ) : (
                    <span className="text-slate-500">
                      Awaiting audio input...
                    </span>
                  )}
                </ResultBlock>

                <ResultBlock
                  title="Step B: Interpret (Text-to-Intent)"
                  isLoading={loadingStates.interpreting}
                >
                  {intentData ? (
                    <pre>
                      <code>{JSON.stringify(intentData, null, 2)}</code>
                    </pre>
                  ) : (
                    <span className="text-slate-500">
                      Awaiting transcription...
                    </span>
                  )}
                </ResultBlock>

                <ResultBlock title="Step C: Synthesize (Text-to-Speech)">
                  {synthesizedText ? (
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-5 h-5 text-cyan-300" />
                      <span>{`Generated Reply: "${synthesizedText}"`}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500">
                      Awaiting interpretation...
                    </span>
                  )}
                </ResultBlock>
              </div>
            </Card>
          )}

          {pipelineType === "image" && (
            <Card className="mt-6">
              <Title
                icon={<FileText className="w-6 h-6 text-cyan-300" />}
                text="2. Image Processing Pipeline"
              />
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div>
                  <h3 className="text-sm font-semibold text-cyan-300 mb-2">
                    Input Image:
                  </h3>
                  {imageDataUrl && (
                    <img
                      src={imageDataUrl}
                      alt="Uploaded document"
                      className="rounded-lg shadow-md max-h-80 w-auto mx-auto md:mx-0"
                    />
                  )}
                </div>
                <ResultBlock
                  title="Step A: Extract (OCR to Structured JSON)"
                  isLoading={loadingStates.extracting}
                >
                  {extractedData ? (
                    <pre>
                      <code>{JSON.stringify(extractedData, null, 2)}</code>
                    </pre>
                  ) : (
                    <span className="text-slate-500">Processing image...</span>
                  )}
                </ResultBlock>
              </div>
            </Card>
          )}

          {pipelineType === "unsupported" && (
            <Card className="mt-6 border-red-500/50">
              <p className="text-red-400 text-center">
                Unsupported file type. Please upload a valid audio or image
                file.
              </p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
