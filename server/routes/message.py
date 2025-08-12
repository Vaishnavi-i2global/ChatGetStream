
from fastapi import APIRouter
from typing import Optional
from service.message import get_my_messages_with_attachments_or_links

router = APIRouter()

@router.get("/")
def getmessage(channel_id: str, user_id: str, channel_type: Optional[str] = "messaging"):
    payload = {
        "channel_id": channel_id,   
        "user_id": user_id,
        "channel_type": channel_type    
    }
    return get_my_messages_with_attachments_or_links(payload)