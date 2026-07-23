import os
import asyncio
import logging
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("writegen-gemini")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set. WriteGen AI will run in DEMO/MOCK mode.")
    IS_DEMO_MODE = True
else:
    genai.configure(api_key=GEMINI_API_KEY)
    IS_DEMO_MODE = False

# We use the fast and standard model gemini-3.5-flash for general tasks
MODEL_NAME = "gemini-3.5-flash"

async def mock_stream_generator(prompt: str):
    """Simulates a typing effect stream for testing without an API key."""
    words = f"[DEMO MODE] Here is a mock response because GEMINI_API_KEY is not set.\n\nYour prompt was: '{prompt}'\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales pretium imperdiet. Sed dictum dolor eget elit porta, vel maximus mi tincidunt. Mauris gravida ipsum non nibh scelerisque lobortis. Curabitur sed ante sodales, vulputate dolor sit amet, tristique dolor. Aliquam elementum, felis eget aliquet tristique, sem neque lobortis justo, vitae dictum lorem ante in ipsum. Nam elementum pretium ipsum, non congue lacus interdum ac.".split(" ")
    for word in words:
        yield word + " "
        await asyncio.sleep(0.08)

async def generate_content_stream(prompt: str):
    """Generates and yields chunks of text from Gemini API asynchronously."""
    if IS_DEMO_MODE:
        async for chunk in mock_stream_generator(prompt):
            yield chunk
        return

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        # Use generate_content_async with stream=True for streaming response
        response = await model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        yield f"Error generating content: {str(e)}"

def build_generation_prompt(prompt: str, tone: str, length: str, keywords: list = None) -> str:
    keywords_str = ", ".join(keywords) if keywords else "None"
    return (
        f"You are a professional content generator. Write a {length} content piece about the topic: '{prompt}'. "
        f"The tone of voice should be {tone}. Key phrases or keywords to include: {keywords_str}. "
        f"Provide a structured response with clear headings and paragraphs."
    )

def build_summarize_prompt(text: str, style: str) -> str:
    style_guideline = ""
    if "bullet" in style.lower():
        style_guideline = "Create a bulleted summary highlighting the most critical points."
    elif "key takeaway" in style.lower() or "takeaway" in style.lower():
        style_guideline = "Create a brief summary focusing purely on the primary key takeaways and core conclusion."
    else:
        style_guideline = "Create a detailed, well-structured, cohesive narrative summary."

    return (
        f"You are an expert summarizer. Summarize the following text. "
        f"Guideline: {style_guideline}\n\n"
        f"--- Start Text ---\n"
        f"{text}\n"
        f"--- End Text ---"
    )

def build_email_prompt(recipient: str, sender: str, purpose: str, key_points: list, tone: str) -> str:
    key_points_str = "\n".join([f"- {point}" for point in key_points])
    return (
        f"You are an expert copywriter. Write a {tone} email from '{sender}' to '{recipient}'. "
        f"Purpose of the email: {purpose}.\n"
        f"Key points to cover in the email body:\n{key_points_str}\n\n"
        f"Format the output professionally. Include a 'Subject:' header and a formatted 'Body:' section."
    )

def build_rewrite_prompt(text: str, style: str) -> str:
    return (
        f"You are a professional editor. Rewrite the following text. "
        f"Target rewriting style: make it {style}. "
        f"Ensure you maintain the original meaning, but adapt the structure, tone, flow, and vocabulary "
        f"to match the requested style.\n\n"
        f"--- Start Text ---\n"
        f"{text}\n"
        f"--- End Text ---"
    )
