# WriteGen AI - Modern Full-Stack AI Content Generation Web Application

WriteGen AI is a premium, single-page, full-stack AI content assistant. It enables users to instantly generate high-quality text, summarize long documents, draft emails, and rewrite existing articles. The application features a stunning glassmorphism user interface supporting light/dark modes, custom scrollbars, and fluid animations, with real-time text-streaming (typing effect) directly from Google's Gemini API.

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- **HTML5 & CSS3 (Vanilla)**: High-end custom styling utilizing backdrop-filters, custom glowing shapes, micro-animations, and full responsiveness.
- **JavaScript (ES6, Vanilla)**: Handles real-time API streaming, state management, asynchronous data fetching, dynamic layout updates, and notifications.
- **FontAwesome (v6.4.0)**: Used for modern, clean iconography.
- **Google Fonts (Outfit & Plus Jakarta Sans)**: Premium modern typography.

### Backend
- **FastAPI (v0.100.0+)**: Highly performant ASGI framework serving as the main API layer.
- **Uvicorn (v0.22.0+)**: Production-grade ASGI web server implementation.
- **Motor (v3.2.0+)**: Asynchronous MongoDB driver for Python, enabling non-blocking database queries.
- **Google Generative AI SDK (v0.7.0+)**: Integrates with the `gemini-3.5-flash` model for content generation.
- **Pydantic (v2.0.0+)**: Enforces runtime validation and type consistency for request payloads and database models.
- **Python-dotenv (v1.0.0+)**: Simplifies configuration loading from `.env` files.

---

## 🌟 Key Features

1. **Four Content Generation Tools (Tabs)**:
   - **Generate Content**: Craft articles, ideas, or essays matching selected tones (*Creative, Professional, Academic, Casual, Persuasive*) and lengths (*Short, Medium, Long*) with optional keyword inputs.
   - **Summarize Text**: Convert long texts into concise formats (*Bullet points, Detailed summaries, or core Key Takeaways*).
   - **Email Generator**: Input the recipient, sender, purpose, and key points to instantly write formatted business or casual drafts.
   - **Rewrite Text**: Adapt or improve any text style (*Simplify, Professionalize, Expand, Casual, Persuasive*).
2. **Real-time AI Streaming**: Employs backend generator yielding chunks immediately as they arrive from Gemini, creating a seamless typing effect loop in the frontend.
3. **Interactive Stream Interruption**: Users can abort an ongoing generation stream at any time by clicking the **Clear** button, which signals the frontend reader to cancel the stream.
4. **Theme Customization**: Responsive dark and light mode toggle with state persisted in the browser's `LocalStorage`.
5. **Interactive Client-side Metrics**: Live character limits and counters on text inputs to help users gauge input length.
6. **Robust History Synchronization**: Saves prompt history and responses asynchronously, allowing users to view past prompts, delete records, or click on a card to automatically load past options and responses back into the workspace.
7. **Graceful Failbacks**: Automatically runs in a mock **Demo Mode** if no Google Gemini API Key is configured, simulating response streams.

---

## 🏗️ Project Architecture

```
d:\ibm project\
├── backend/
│   ├── __init__.py
│   ├── main.py          # FastAPI app launcher, CORS middleware, static folder mounting
│   ├── routes.py        # API routes (generating content, summaries, emails, rewrites, history)
│   ├── gemini.py        # Google Generative AI client config, templates, & generators
│   ├── database.py      # Async MongoDB database client using Motor
│   ├── models.py        # Pydantic schemas validating request payload and history data
│   └── .env             # Environment variables (configured during setup)
├── static/
│   ├── index.html       # Single-page application structure
│   ├── style.css        # Premium CSS rules (dark/light themes, layouts, animations)
│   └── app.js           # Frontend client (theme controller, stream readers, forms, history sync)
├── Dockerfile           # Optimized single-stage Python 3.11-slim container setup
├── docker-compose.yml   # Multi-container local orchestration (App + MongoDB database)
├── requirements.txt     # Python backend dependencies
└── README.md            # Documentation guide
```

---

## 🔌 API Architecture & Endpoints

All endpoints are built using FastAPI and enforce structured data validation via Pydantic schemas:

| Endpoint | Method | Description | Request Model | Response Format |
|---|---|---|---|---|
| `/api/health` | `GET` | Health check verifying database and application connectivity status | None | JSON |
| `/api/generate/content` | `POST` | Streams text output for standard content generation | `GenerateRequest` | Text Stream (plain/text) |
| `/api/generate/summarize` | `POST` | Streams text summary of a longer input document | `SummarizeRequest` | Text Stream (plain/text) |
| `/api/generate/email` | `POST` | Streams structured email draft with sender, recipient details | `EmailRequest` | Text Stream (plain/text) |
| `/api/generate/rewrite` | `POST` | Streams rewritten text matching selected tone/complexity style | `RewriteRequest` | Text Stream (plain/text) |
| `/api/history` | `GET` | Retrieves the 30 most recent prompt and response history items | None | JSON array of `HistoryItem` |
| `/api/history/{item_id}` | `DELETE` | Deletes a generation history item by database ID | None | JSON |

---

## 💾 Database Schema (MongoDB)

History records are stored in MongoDB under the `history` collection inside the `writegen_ai` database. The database records map directly to the Pydantic `HistoryItem` schema:

```json
{
  "_id": "ObjectId",
  "prompt": "String (Main prompt or raw source text)",
  "type": "String ('generate' | 'summarize' | 'email' | 'rewrite')",
  "options": {
    "tone": "String (Optional)",
    "length": "String (Optional)",
    "keywords": ["String (Optional)"],
    "style": "String (Optional)",
    "text_length": "Number (Optional)",
    "recipient": "String (Optional)",
    "sender": "String (Optional)",
    "purpose": "String (Optional)",
    "key_points": ["String (Optional)"]
  },
  "response": "String (Full generated AI response text)",
  "timestamp": "String (ISO format datetime, e.g. '2026-07-23T12:00:15.000Z')"
}
```

---

## ⚙️ Quick Start with Docker (Recommended)

To run the application and database together in minutes:

1. **Clone or navigate** to the project directory:
   ```bash
   cd "d:\ibm project"
   ```
2. **Configure your API Key**:
   Open the `.env` file and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *Note: If left blank, the app will run in mock Demo Mode.*
3. **Launch the Docker Compose pipeline**:
   ```bash
   docker-compose up --build
   ```
4. Open your browser and navigate to: [http://localhost:8000](http://localhost:8000)

---

## 🐍 Manual Local Installation

If you prefer to run the backend Python server and a local MongoDB instance manually:

### Prerequisites
- Python 3.10 or 3.11 installed.
- A running MongoDB server at `mongodb://localhost:27017` (or change `MONGODB_URI` in `.env`).

### Setup Instructions

1. **Navigate to the workspace root**:
   ```bash
   cd "d:\ibm project"
   ```
2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Setup environment configurations**:
   Ensure you copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   In `.env`, configure:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=writegen_ai
   PORT=8000
   ```
5. **Run the FastAPI server**:
   ```bash
   python -m backend.main
   ```
6. Visit [http://localhost:8000](http://localhost:8000) in your web browser.

---

## 🔑 How to Get a Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in using your Google Account.
3. Click on the **Get API Key** button in the top left.
4. Click **Create API Key**, choose a project, and copy the generated key.
5. Paste the key into the `GEMINI_API_KEY` field in your `.env` file.
