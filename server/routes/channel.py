from fastapi import APIRouter
from service.channel import post_channel

router = APIRouter()

@router.post("/")
async def channel(payload:dict):
    return await post_channel(payload)
