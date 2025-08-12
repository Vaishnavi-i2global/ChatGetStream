from typing import Optional, List
from fastapi import Form, File, UploadFile, HTTPException
import mimetypes
import re
from stream_chat import StreamChat
import asyncio

# Make sure you have these imports and your server_client defined
# from your_stream_client import server_client
# url_regex = re.compile(r'https?://[^\s]+')

server_client = StreamChat(api_key="u66j6en37tv4", api_secret="5hezjeytwyhwnhpkk8wmn6yx4s6f3dd43he8kftynug3snmzfcgukhuyrtsmfjdp")

from fastapi import HTTPException

from fastapi import HTTPException
import re

def get_message(payload: dict):
    channel_id = payload.get("channel_id")
    if not channel_id:
        raise HTTPException(status_code=400, detail="Channel ID is required")

    channel_type = payload.get("channel_type", "messaging")  # default to "messaging"
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")

    try:
        filters = {
            "cid": f"{channel_type}:{channel_id}",
            "members": {"$in": [user_id]}
        }

        # Query channels
        response = server_client.query_channels(filter_conditions=filters)

        channels = response.get("channels", [])
        if not channels:
            return []

        # The first channel's state
        channel_state = channels[0]
        messages = channel_state.get("messages", [])

        results = []
        url_pattern = r"https?://\S+"

        for msg in messages:
            attachments = msg.get("attachments", [])
            text = msg.get("text", "")
            links = re.findall(url_pattern, text)

            results.append({
                "attachments": attachments,
                "links": links
            })
            print("results:", results)
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))