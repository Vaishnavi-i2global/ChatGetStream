from bson import ObjectId
from stream_chat import StreamChat
from fastapi import HTTPException
from database import db
server_client = StreamChat(api_key="u66j6en37tv4", api_secret="5hezjeytwyhwnhpkk8wmn6yx4s6f3dd43he8kftynug3snmzfcgukhuyrtsmfjdp")


# async def post_channel(payload: dict):
#     try:
#         sender_id = payload.get("sender_id")
#         receiver_id = payload.get("receiver_id")
#         created_by = payload.get("created_by")

#         if not sender_id or not receiver_id or not created_by:
#             raise HTTPException(status_code=400, detail="Missing required fields")

#         members = [sender_id, receiver_id]

#         # Check if a distinct channel with these members already exists
#         filters = {
#             "type": "messaging",
#             "distinct": True,
#             "members": {"$eq": members}  # Exact same members
#         }
#         response = server_client.query_channels(filters)

#         if response["channels"]:
#             # Return the existing channel ID
#             channel_id = response["channels"][0]["channel"]["id"]
#             print(f"Channel already exists: {channel_id}")
#             return {"status": "exists", "channel_id": channel_id}

#         # Otherwise, create a new one
#         channel = server_client.channel(
#             "messaging",
#             data={"members": members, "distinct": True}
#         )
#         channel.create(created_by)

#         return {"status": "success", "channel_id": channel.id}

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
    

    
async def post_channel(payload: dict):
    try:
        sender_id = payload.get("sender_id")
        receiver_id = payload.get("receiver_id")
        created_by = payload.get("created_by")
 
        if not sender_id or not receiver_id or not created_by:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Fetch user details from DB
        sender_info = await db.users.find_one({"_id": ObjectId(sender_id)})
        print(sender_info, "Sender Info")
        receiver_info = await db.users.find_one({"_id":ObjectId(receiver_id)})    
        print(receiver_info, "Receiver Info")    

        if not sender_info or not receiver_info:
            raise HTTPException(status_code=404, detail="Sender or Receiver user not found")

        users_to_upsert = [
            {
                "id": str(sender_info["_id"]),
                "name": sender_info.get("username", ""),
               
            },
            {
                "id": str(receiver_info["_id"]),
                "name": receiver_info.get("username", ""),
              
            },
        ]

        server_client.upsert_users(users_to_upsert)

        members = [sender_id, receiver_id]

        filters = {
            "type": "messaging",
            "distinct": True,
            "members": {"$eq": members}
        }
        response = server_client.query_channels(filters)

        if response.get("channels"):
            channel_id = response["channels"][0]["channel"]["id"]
            print(f"Channel already exists: {channel_id}")
            return {"status": "exists", "channel_id": channel_id}

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

