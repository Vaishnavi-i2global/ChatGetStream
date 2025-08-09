# main.py
from fastapi import FastAPI
from dotenv import load_dotenv
from server.routes import (users)  # Import users
load_dotenv()

app = FastAPI()

# Register users router
app.include_router(users.router, prefix="/users", tags=["users"])

@app.get("/")
def home():
    return {"message": "Hello, FastAPI!"}
