# 🪄 WriteGen AI

![WriteGen AI Banner](https://img.shields.io/badge/WriteGen%20AI-Intelligent%20Content%20Generation-blue?style=for-the-badge&logo=googlebard)

> A modern, full-stack AI content generation platform powered by the Google Gemini API.

## 📖 Project Overview
WriteGen AI is an intelligent content creation workspace that helps users seamlessly generate, summarize, format, and rewrite text. Built with a lightning-fast FastAPI backend and a sleek, glassmorphic vanilla JavaScript frontend, it streams AI responses in real-time. With full user authentication and MongoDB integration, WriteGen AI securely saves your generation history so you never lose a great idea.

## ✨ Features
- **Real-Time AI Streaming**: Watch your content generate word-by-word instantly.
- **Content Generation**: Write creative, professional, or academic content based on prompts, keywords, and tone.
- **Text Summarizer**: Condense long articles into bullet points, detailed paragraphs, or key takeaways.
- **Email Drafter**: Instantly compose professional or casual emails based on a sender, recipient, and key points.
- **Text Rewriter**: Improve your drafts by simplifying, expanding, or making them more persuasive.
- **User Authentication**: Secure JWT-based login and registration system.
- **History Tracking**: Automatically saves all generations to MongoDB for logged-in users.
- **Responsive Design**: Beautiful dark-mode UI with glassmorphism aesthetics.
- **Export Options**: Copy to clipboard or download generated content as `.txt` files.

---

## 🛠️ Tech Stack
| Tier | Technologies |
|------|--------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, FontAwesome, Google Fonts |
| **Backend** | Python 3.10+, FastAPI, Uvicorn |
| **Database** | MongoDB Atlas, Motor (Async Python Driver) |
| **AI Integration** | Google Generative AI SDK (`google-generativeai`), Gemini Models |
| **Authentication** | JWT (`PyJWT`), Password Hashing (`passlib[bcrypt]`) |
| **Environment** | `python-dotenv` |

---

## 📁 Project Structure

```text
WriteGen_AI/
├── backend/
│   ├── main.py        # Application entry point, server config, and lifespan events
│   ├── routes.py      # All REST API endpoints (Auth, Generate, History)
│   ├── database.py    # MongoDB connection setup and collection getters
│   ├── auth.py        # JWT generation, token verification, and password hashing
│   ├── gemini.py      # Google Gemini API configuration, prompt building, and streaming
│   └── models.py      # Pydantic schemas for data validation (Requests & Responses)
├── static/
│   ├── index.html     # Main user interface (SPA)
│   ├── style.css      # Styling, layout, and animations
│   └── app.js         # Frontend logic, event listeners, and API fetch calls
├── requirements.txt   # Python dependencies
├── .env.example       # Example environment variables file
└── README.md          # Project documentation (You are here)
```

### Architecture Breakdown
- **`backend/main.py`**: Initializes the FastAPI app, configures CORS, handles database connection lifespans, and mounts the static files and API router.
- **`backend/routes.py`**: The core router containing every API endpoint. It links the frontend HTTP requests to the database and Gemini models.
- **`backend/database.py`**: Manages the asynchronous MongoDB connection using Motor. Exports helper functions to fetch collections.
- **`backend/auth.py`**: Handles security. Uses `passlib` to hash passwords and `PyJWT` to encode/decode access tokens for protected routes.
- **`backend/gemini.py`**: Houses the logic for communicating with Google's Generative AI. It constructs strict prompts based on user options and yields asynchronous streaming responses.
- **`backend/models.py`**: Uses Pydantic to strictly type incoming JSON request bodies (e.g., `UserCreate`, `GenerateRequest`) and outgoing responses.
- **`static/`**: Contains the frontend Single Page Application (SPA). The HTML provides the structure, CSS provides the dark glassmorphic theme, and JS orchestrates the interactive DOM updates and API calls.
- **`.env`**: Stores sensitive credentials outside of source control.

---

## ⚙️ Prerequisites
Ensure you have the following installed on your system before proceeding:
- **Python 3.10** or higher
- **pip** (Python package installer)
- A **Google Gemini API Key**
- A **MongoDB Atlas** account and cluster

---

## 🚀 Installation

Follow these steps exactly to set up the project locally.

**1. Clone the repository and navigate into it**
```bash
git clone <your-repo-url>
cd WriteGen_AI
```

**2. Create a virtual environment**
```bash
python -m venv venv
```

**3. Activate the virtual environment**
* **Windows:**
  ```cmd
  venv\Scripts\activate
  ```
* **Mac/Linux:**
  ```bash
  source venv/bin/activate
  ```

**4. Install dependencies**
```bash
pip install -r requirements.txt
```

---

## 🔐 Environment Variables (.env)

Create a file named `.env` in the root directory (next to `requirements.txt`). You can use `.env.example` as a template.

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=writegen_db
PORT=8000
JWT_SECRET_KEY=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256
```

### Variable Breakdown:
- **`GEMINI_API_KEY`**: Your secret key to access Google's Gemini models.
- **`MONGODB_URI`**: The connection string provided by MongoDB Atlas. It includes your username, password, and cluster address.
- **`MONGODB_DB`**: The name of the database that WriteGen AI will create and use (e.g., `writegen_db`).
- **`PORT`**: The port number on which the FastAPI server will run (default is `8000`).
- **`JWT_SECRET_KEY`**: A long, random, and secure string used to digitally sign authentication tokens. (e.g., generate one via `openssl rand -hex 32`).
- **`JWT_ALGORITHM`**: The cryptographic algorithm used for signing the JWT (leave as `HS256`).

---

## 🔑 How to Obtain API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google Account.
3. Click **"Create API key"**.
4. Copy the key and paste it into your `.env` file under `GEMINI_API_KEY`.

### MongoDB Atlas Connection String
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign in/register.
2. Create a new Cluster (the free tier works perfectly).
3. Under **Database Access**, create a user with a username and password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) for development.
5. Go to **Database** > **Connect** > **Drivers**.
6. Copy the connection string. Replace `<username>` and `<password>` with the database user credentials you created in Step 3. Paste this into your `.env` file under `MONGODB_URI`.

---

## 💻 Running the Backend & Frontend

WriteGen AI is configured so that the FastAPI backend automatically serves the frontend static files. You only need to run one command!

**Run the Server:**
```bash
python -m backend.main
```

You should see output indicating that Uvicorn is running and that MongoDB has successfully connected.

**Access the App:**
Open your web browser and navigate to:
👉 **[http://localhost:8000](http://localhost:8000)**

*(Note: The API documentation is automatically generated and available at [http://localhost:8000/docs](http://localhost:8000/docs))*

---

## 📡 API Endpoints

### 🟢 General Endpoints
| Method | URL | Purpose |
|--------|-----|---------|
| `GET` | `/api/health` | Verifies the server is running and the database is connected. |

### 🔐 Authentication Endpoints
| Method | URL | Request Body (JSON) | Response (JSON) | Purpose |
|--------|-----|----------------------|-----------------|---------|
| `POST` | `/api/auth/register` | `{ "email": "...", "password": "...", "name": "..." }` | `{ "access_token": "...", "token_type": "bearer", "name": "..." }` | Creates a new user account and returns a JWT. |
| `POST` | `/api/auth/login` | `{ "email": "...", "password": "..." }` | `{ "access_token": "...", "token_type": "bearer", "name": "..." }` | Authenticates a user and returns a JWT. |

### 🤖 Generation Endpoints
*(Note: All generation endpoints return a `text/plain` streaming response using HTTP chunked transfer encoding.)*

| Method | URL | Request Body (JSON) | Purpose |
|--------|-----|----------------------|---------|
| `POST` | `/api/generate/content` | `{ "prompt": "...", "tone": "Creative", "length": "Medium", "keywords": ["ai"] }` | Streams general content generation based on prompt constraints. |
| `POST` | `/api/generate/summarize` | `{ "text": "...", "style": "Bullet Points" }` | Streams a summarization of the provided long-form text. |
| `POST` | `/api/generate/email` | `{ "recipient": "...", "sender": "...", "purpose": "...", "key_points": ["..."], "tone": "Professional" }` | Streams an email draft. |
| `POST` | `/api/generate/rewrite` | `{ "text": "...", "style": "Simplify" }` | Streams a rewritten version of the provided text. |

### 📜 History Endpoints
*(Note: Require `Authorization: Bearer <token>` header)*

| Method | URL | Response | Purpose |
|--------|-----|----------|---------|
| `GET` | `/api/history` | Array of `HistoryItem` objects | Fetches the logged-in user's past generations, sorted chronologically. |
| `DELETE`| `/api/history/{item_id}`| `{ "status": "success", "message": "..." }` | Deletes a specific history item by its MongoDB `_id`. |

---

## 🗄️ Database Collections

The MongoDB database (`writegen_db`) contains two primary collections:
1. **`users`**: Stores user account information (Name, Email, Hashed Passwords).
2. **`history`**: Stores generation records (User ID, Prompt, Metadata Options, Generated Text, Timestamp).

---

## 💡 Demo Workflow / Usage Guide

1. **Launch**: Start the server and visit `http://localhost:8000`.
2. **Authenticate**: Click **Log In / Register** in the sidebar. Create an account.
3. **Select a Tool**: Use the top tabs to choose between *Generate Content*, *Summarize Text*, *Email Generator*, or *Rewrite Text*.
4. **Configure**: Fill out the required text fields and adjust the dropdown menus (e.g., Tone, Length, Style).
5. **Generate**: Click the submit button. Watch the right-hand panel as the AI streams the response directly to your screen in real-time.
6. **Export**: Click **Copy** or **Download** in the output panel to save your work.
7. **History**: Open the sidebar (hamburger menu on mobile) to view and reload your past generations.

---

## 🛑 Error Handling & Troubleshooting

If you run into issues, check the terminal output where you ran `python -m backend.main`.

| Issue | Cause & Solution |
|-------|------------------|
| **MongoDB connection errors** (`ServerSelectionTimeoutError`) | The `MONGODB_URI` is incorrect, or your current IP address is not whitelisted in MongoDB Atlas Network Access. |
| **Invalid API key** (`400 Bad Request` from Gemini) | Your `GEMINI_API_KEY` is missing or invalid. Verify it in your `.env` file. |
| **429 Quota Exceeded** | You have hit the rate limit for the free tier of the Gemini API. Wait a few minutes and try again. |
| **503 Model Busy** | Google's Gemini servers are currently overloaded. Try again in a few seconds. |
| **JWT module missing** | You installed `jwt` instead of `PyJWT`. Run: `pip uninstall jwt` and then `pip install PyJWT`. |
| **bcrypt version issues** | Passlib might complain about missing bcrypt. Ensure you install using `pip install passlib[bcrypt]`. |
| **Environment variables not loading** | The backend cannot find the `.env` file. Ensure it is located in the exact root folder of `WriteGen_AI`. |

---

## 📦 Dependencies

Major dependencies defined in `requirements.txt`:
- `fastapi` & `uvicorn` (Web framework and ASGI server)
- `google-generativeai` (Google's official Gemini Python SDK)
- `motor` (Asynchronous MongoDB driver)
- `passlib[bcrypt]` (Password hashing)
- `PyJWT` (JSON Web Token generation)
- `python-dotenv` (Environment variable management)
- `pydantic` (Data validation)

---

## 🚀 Future Improvements
- **Document Uploads**: Allow users to upload PDF or DOCX files for summarization.
- **Export to PDF**: Add functionality to download generated content directly as beautifully formatted PDFs.
- **Prompt Templates**: Allow users to save their favorite generation settings as reusable templates.
- **Dark/Light Mode Persistence**: Save the user's theme preference to their profile in the database.

---

## 🤝 Contributing
Contributions are welcome!
1. Fork the repository
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
