from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    name: str = Field(..., description="User full name")

class UserLogin(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class Token(BaseModel):
    access_token: str
    token_type: str
    name: str

class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="The main topic or prompt for content generation")
    tone: str = Field("Creative", description="Tone of the response (e.g., Professional, Casual, Creative, Academic)")
    length: str = Field("Medium", description="Length of the response (Short, Medium, Long)")
    keywords: Optional[List[str]] = Field(default=None, description="Keywords to include in the output")

class SummarizeRequest(BaseModel):
    text: str = Field(..., description="Text to be summarized")
    style: str = Field("Bullet Points", description="Summary style (e.g., Bullet Points, Detailed, Key Takeaway)")

class EmailRequest(BaseModel):
    recipient: str = Field(..., description="Recipient of the email")
    sender: str = Field(..., description="Sender of the email")
    purpose: str = Field(..., description="Purpose or context of the email")
    key_points: List[str] = Field(..., description="Key points to cover in the email")
    tone: str = Field("Professional", description="Tone of the email (e.g., Professional, Friendly, Urgent, Casual)")

class RewriteRequest(BaseModel):
    text: str = Field(..., description="Text to be rewritten")
    style: str = Field("Professionalize", description="Rewriting style (e.g., Simplify, Professionalize, Expand, Casual, Friendly)")

class HistoryItem(BaseModel):
    id: str = Field(..., alias="_id", description="MongoDB Document ID")
    user_id: Optional[str] = Field(None, description="ID of the user who owns this history")
    prompt: str = Field(..., description="Original prompt / source text")
    type: str = Field(..., description="Tab type (generate, summarize, email, rewrite)")
    options: Dict[str, Any] = Field(default_factory=dict, description="Metadata options used for generation")
    response: str = Field(..., description="Generated text output")
    timestamp: str = Field(..., description="Timestamp of creation")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "60c72b2f9b1d8e1f4088a221",
                "prompt": "Artificial Intelligence in Education",
                "type": "generate",
                "options": {"tone": "Creative", "length": "Medium", "keywords": ["learning", "future"]},
                "response": "Artificial Intelligence is transforming how we learn...",
                "timestamp": "2026-07-20T16:44:15.000Z"
            }
        }
