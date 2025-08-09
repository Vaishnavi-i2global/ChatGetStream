from fastapi import APIRouter
from models.users import UserSignup, UserLogin, UserResponse
from service.chat import handle_stream_connection

router = APIRouter()

@router.post("/stream_connection")
async def stream_connection(payload:dict):
    return await handle_stream_connection(payload)
