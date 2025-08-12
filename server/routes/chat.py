from fastapi import APIRouter
from models.users import UserSignup, UserLogin, UserResponse
from service.chat import handle_stream_connection
from service.channel import post_channel

router = APIRouter()

@router.post("/stream_connection")
async def stream_connection(payload:dict):
    return await handle_stream_connection(payload)

@router.post("/create_channel")
async def create_channel(payload:dict):
    return await post_channel(payload)
