# main.py
from fastapi import FastAPI
from dotenv import load_dotenv
from routes.users import router as users_router

load_dotenv()

app = FastAPI()

# Register users router
app.include_router(users_router, prefix="/users", tags=["users"])

@app.get("/")
def home():
    return {"message": "Hello, FastAPI!"}
