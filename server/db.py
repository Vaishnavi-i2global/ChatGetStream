# db.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "Chattesting")

client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB]
print(f"Connected to MongoDB at {MONGO_URL}, database: {MONGO_DB}")
