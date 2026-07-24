import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from the root .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=env_path)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("writegen-db")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB", "writegen_ai")

logger.info(f"Connecting to MongoDB at: {MONGODB_URI.split('@')[-1] if '@' in MONGODB_URI else MONGODB_URI}")

client = None
db = None
history_collection = None
users_collection = None

try:
    client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
    db = client[DB_NAME]
    history_collection = db["history"]
    users_collection = db["users"]
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    db = None
    history_collection = None
    users_collection = None

def get_history_collection():
    """Returns the history collection helper."""
    return history_collection

def get_users_collection():
    """Returns the users collection helper."""
    return users_collection

async def ping_database():
    """Verify that MongoDB is running and reachable."""
    if client is None:
        return False
    try:
        # The ismaster command is cheap and does not require auth.
        await client.admin.command("ping")
        return True
    except Exception as e:
        logger.error(f"MongoDB ping failed: {e}")
        return False
