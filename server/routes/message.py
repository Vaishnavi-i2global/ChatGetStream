
from service.message import get_message
from fastapi import APIRouter, Form, UploadFile, File
from typing import List, Optional


router = APIRouter()

@router.get("/")
def getmessage(chennal_id: str, user_id: Optional[str] = None):
    return get_message({"channel_id": chennal_id, "user_id": user_id})
