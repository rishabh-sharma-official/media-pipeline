**Modular Media & Data Processing Pipeline**

This repository demonstrates a modular pipeline for processing audio and image files. It can transcribe speech from files or a live microphone, infer intent, synthesize a spoken reply, and extract structured data from documents. The entire system is built as a modern React application.

**Repository Structure**

The project is organized into logical folders to ensure a clean separation of concerns, making it scalable and easy to navigate.

src/
├── components/ # Reusable React UI components (Card, Title, etc.)
│ ├── Card.js
│ ├── Title.js
│ └── ResultBlock.js
├── modules/ # Core logic for pipeline step.
│ ├── transcribe/
│ │ └── index.js # Logic for converting audio to text.
│ ├── interpret/
│ │ └── index.js # Logic for understanding text intent.
│ ├── synthesize/
│ │ └── index.js # Logic for converting text to speech.
│ └── extract/
│ └── index.js # Logic for extracting data from images.
├── services/ # Centralized services, like API callers.
│ └── api.js
└── App.js # Main component: The Orchestrator.
└── index.js # Entry point for the React application.

** How to Run **

1. Prerequisites: Ensure you have Node.js and npm (or yarn) installed.

2. Clone the Repository:
   //>> git clone <repository url>
   //>> cd repository-name

3. Install Dependencies:
   npm install

4. Run the Application:
   npm start

This will start the development server, and you can view the application in your browser, usually at http://localhost:3000.

But Since I will be deploying the project, therefore these steps will not be required.

---

**Design and Key Decisions**

Architecture:
-- The Orchestrator Pattern
The application is built around the Orchestrator Pattern. The App.js component acts as a central coordinator. It doesn't perform the business logic itself, instead, it manages state and directs the flow of data by calling the specialized modules in the correct order.
This design makes the application easy and highly modular.

-- Unified AI Backend
Instead of integrating multiple different AI services for transcription, NLU, and OCR, we use the Gemini API as a single, unified backend.
This has several advantages:

\*Simplicity: Only need to manage one API and one client (api.js).

\*Consistency: The input and output formats are consistent across different modalities.

---

**Sample Inputs & Outputs**

-- Audio Pipeline
Input: User uploads sample.wav containing the speech "Set a timer for 15 minutes".

transcribe Output: "Set a timer for 15 minutes"

interpret Output (Final JSON):

{
"intent": "set_timer",
"parameters": {
"duration_minutes": 15
}
}

synthesize Output: A synthesized female voice speaks the sentence: "Setting a timer for 15 minutes."

-- Image Pipeline
Input: User uploads doc.png, an image of a business card.

extract Output (Final JSON):

{
"name": "Jane Doe",
"title": "Software Engineer",
"company": "Tech Solutions Inc.",
"phoneNumber": "123-456-7890",
"email": "jane.doe@techsolutions.com",
"website": "techsolutions.com"
}

Tools Used:
Visual Studio Code, Github CoPilot, Gemini API, Node.js, React.js, TailwindCSS, ChatGPT, Stack Overflow.
