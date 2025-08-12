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



def get_my_messages_with_attachments_or_links(payload: dict):
    channel_id = payload.get("channel_id")
    if not channel_id:
        raise HTTPException(status_code=400, detail="Channel ID is required")

    channel_type = payload.get("channel_type", "messaging")
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")

    try:
        filters = {"cid": f"{channel_type}:{channel_id}"}
        response = server_client.query_channels(filter_conditions=filters)

        channels = response.get("channels", [])
        if not channels:
            return []

        messages = channels[0].get("messages", [])
        results = []

        url_pattern = r"https?://\S+"

        for msg in messages:
            if msg.get("user", {}).get("id") == user_id:
                attachments = msg.get("attachments", [])
                text = msg.get("text", "")
                links = re.findall(url_pattern, text)

                if attachments or links:
                    results.append({
                        "attachments": attachments,
                        "links": links
                    })

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))