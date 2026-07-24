import os
import uvicorn
import logging
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from backend.routes import router as api_router
from backend.database import ping_database

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("writegen-main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Starting up WriteGen AI FastAPI backend...")
    db_connected = await ping_database()
    if db_connected:
        logger.info("Successfully connected to MongoDB.")
    else:
        logger.warning("MongoDB is currently offline or unreachable. History saving will fail.")
    yield
    # Shutdown actions
    logger.info("Shutting down WriteGen AI FastAPI backend...")

app = FastAPI(
    title="WriteGen AI Backend",
    description="FastAPI Backend for WriteGen AI content generation platform powered by Google Gemini API.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(api_router)

# Mount the static directory to serve HTML, CSS, and JS
static_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if not os.path.exists(static_path):
    os.makedirs(static_path, exist_ok=True)
    logger.info(f"Created static files directory at {static_path}")

app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)

@app.get("/")
async def serve_frontend():
    """Serve the single-page application."""
    index_file = os.path.join(static_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "WriteGen AI is running. Please create static/index.html to view the frontend."}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    # Run the server
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
