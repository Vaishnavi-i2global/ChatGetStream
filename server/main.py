# main.py
from fastapi import FastAPI
from dotenv import load_dotenv
from routes import (users,chat,channel,message)  # Import users
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",  # React frontend
    "http://127.0.0.1:3000",
    "*"  # Allow all (only for testing, not recommended in prod)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],    
)
# Register users router
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(channel.router, prefix="/channel", tags=["channel"])
app.include_router(message.router, prefix="/message", tags=["message"])

@app.get("/")
def home():
    return {"message": "Hello, FastAPI!"}
