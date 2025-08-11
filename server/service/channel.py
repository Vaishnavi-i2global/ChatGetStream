from stream_chat import StreamChat
from fastapi import HTTPException

server_client = StreamChat(api_key="u66j6en37tv4", api_secret="5hezjeytwyhwnhpkk8wmn6yx4s6f3dd43he8kftynug3snmzfcgukhuyrtsmfjdp")


async def post_channel(payload: dict):
    try:
        student_id = payload.get("student_id")
        tutor_id = payload.get("tutor_id")
        created_by = payload.get("created_by")

        if not student_id or not tutor_id or not created_by:
            raise HTTPException(status_code=400, detail="Missing required fields")

        members = [student_id, tutor_id]

        # Check if a distinct channel with these members already exists
        filters = {
            "type": "messaging",
            "distinct": True,
            "members": {"$eq": members}  # Exact same members
        }
        response = server_client.query_channels(filters)

        if response["channels"]:
            # Return the existing channel ID
            channel_id = response["channels"][0]["channel"]["id"]
            print(f"Channel already exists: {channel_id}")
            return {"status": "exists", "channel_id": channel_id}

        # Otherwise, create a new one
        channel = server_client.channel(
            "messaging",
            data={"members": members, "distinct": True}
        )
        channel.create(created_by)

        return {"status": "success", "channel_id": channel.id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
