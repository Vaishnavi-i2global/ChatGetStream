# db.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv(
    "MONGO_URL")
MONGO_DB = os.getenv(
    "MONGO_DB",
    "getstream"  # Your database name from the connection string
)

client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB]

# Optional: test connection on startup

try:
    client.admin.command("ping")
    print(f"✅ Connected to MongoDB at {MONGO_URL}, database: {MONGO_DB}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
