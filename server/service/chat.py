from stream_chat import StreamChat
from fastapi import HTTPException
server_client = StreamChat(api_key="u66j6en37tv4", api_secret="5hezjeytwyhwnhpkk8wmn6yx4s6f3dd43he8kftynug3snmzfcgukhuyrtsmfjdp")

# channel = server_client.channel("messaging", "test_channel")


# channel.create(user_id)
# channel.update({"name": "my channel", "image": "image url", "mycustomfield": "123"})
async def handle_stream_connection(payload: dict):
    try:

        existing_user = server_client.query_users({"id": {"$eq": payload["user_id"]}})
        print(existing_user,"sdf")
        token = None
        if existing_user and len(existing_user["users"]) > 0:
            token = server_client.create_token(payload["user_id"])
        else:
            server_client.upsert_users([{
                "id": payload["user_id"],
                "name": payload["name"],
                "image": payload.get("image", ""),
                # "role": "tutor",
            }])
            token = server_client.create_token(payload["user_id"])

        return {
            "token": token,
            "user": {
                "id": str(payload["user_id"]),
                "name": payload["name"],
                "image": payload.get("image", "")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
