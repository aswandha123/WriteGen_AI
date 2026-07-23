import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from bson import ObjectId

from backend.models import GenerateRequest, SummarizeRequest, EmailRequest, RewriteRequest
from backend.database import get_history_collection, ping_database
from backend.gemini import (
    generate_content_stream,
    build_generation_prompt,
    build_summarize_prompt,
    build_email_prompt,
    build_rewrite_prompt
)

# Setup logger
logger = logging.getLogger("writegen-routes")

router = APIRouter()

async def save_to_history(prompt: str, tab_type: str, options: dict, response_text: str):
    """Asynchronously writes a query and its final response to the database."""
    collection = get_history_collection()
    if collection is None:
        logger.warning("MongoDB collection not initialized. History not saved.")
        return
    
    try:
        document = {
            "prompt": prompt,
            "type": tab_type,
            "options": options,
            "response": response_text,
            "timestamp": datetime.utcnow().isoformat()
        }
        await collection.insert_one(document)
        logger.info(f"Successfully saved {tab_type} generation history.")
    except Exception as e:
        logger.error(f"Error saving history item: {e}")

async def stream_and_accumulate(full_prompt: str, prompt_text: str, tab_type: str, options: dict):
    """Generator that streams responses from Gemini API and saves to MongoDB once complete."""
    full_text = ""
    try:
        async for chunk in generate_content_stream(full_prompt):
            full_text += chunk
            yield chunk
        
        # After stream finishes successfully, save the full interaction
        if full_text.strip() and not full_text.startswith("Error generating content"):
            await save_to_history(
                prompt=prompt_text,
                tab_type=tab_type,
                options=options,
                response_text=full_text
            )
    except Exception as e:
        logger.error(f"Error inside generator: {e}")
        yield f"\n[Generation Error: {str(e)}]"

# Endpoints
@router.get("/api/health")
async def health_check():
    """Verify database and general status of the app."""
    db_alive = await ping_database()
    return {
        "status": "healthy",
        "database_connected": db_alive,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/api/generate/content")
async def generate_content_endpoint(req: GenerateRequest):
    """Route for standard content generation."""
    prompt_text = req.prompt
    full_prompt = build_generation_prompt(
        prompt=req.prompt,
        tone=req.tone,
        length=req.length,
        keywords=req.keywords
    )
    options = {
        "tone": req.tone,
        "length": req.length,
        "keywords": req.keywords or []
    }
    
    return StreamingResponse(
        stream_and_accumulate(full_prompt, prompt_text, "generate", options),
        media_type="text/plain"
    )

@router.post("/api/generate/summarize")
async def summarize_endpoint(req: SummarizeRequest):
    """Route for text summarization."""
    prompt_text = req.text[:150] + "..." if len(req.text) > 150 else req.text
    full_prompt = build_summarize_prompt(text=req.text, style=req.style)
    options = {
        "style": req.style,
        "text_length": len(req.text)
    }
    
    return StreamingResponse(
        stream_and_accumulate(full_prompt, prompt_text, "summarize", options),
        media_type="text/plain"
    )

@router.post("/api/generate/email")
async def email_endpoint(req: EmailRequest):
    """Route for generating emails."""
    prompt_text = f"Email to {req.recipient}: {req.purpose}"
    full_prompt = build_email_prompt(
        recipient=req.recipient,
        sender=req.sender,
        purpose=req.purpose,
        key_points=req.key_points,
        tone=req.tone
    )
    options = {
        "recipient": req.recipient,
        "sender": req.sender,
        "purpose": req.purpose,
        "key_points": req.key_points,
        "tone": req.tone
    }
    
    return StreamingResponse(
        stream_and_accumulate(full_prompt, prompt_text, "email", options),
        media_type="text/plain"
    )

@router.post("/api/generate/rewrite")
async def rewrite_endpoint(req: RewriteRequest):
    """Route for rewriting text."""
    prompt_text = req.text[:150] + "..." if len(req.text) > 150 else req.text
    full_prompt = build_rewrite_prompt(text=req.text, style=req.style)
    options = {
        "style": req.style,
        "text_length": len(req.text)
    }
    
    return StreamingResponse(
        stream_and_accumulate(full_prompt, prompt_text, "rewrite", options),
        media_type="text/plain"
    )

@router.get("/api/history")
async def get_history():
    """Retrieve history from MongoDB sorted by descending timestamp."""
    collection = get_history_collection()
    if collection is None:
        return []
    
    try:
        cursor = collection.find().sort("timestamp", -1).limit(30)
        history = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            history.append(doc)
        return history
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/api/history/{item_id}")
async def delete_history_item(item_id: str):
    """Delete a history record by ID."""
    collection = get_history_collection()
    if collection is None:
        raise HTTPException(status_code=500, detail="Database client not initialized")
    
    try:
        result = await collection.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="History item not found")
        return {"status": "success", "message": "History item deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting history item: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid ID format: {str(e)}")
