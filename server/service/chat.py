from stream_chat import StreamChat

server_client = StreamChat(api_key="u66j6en37tv4", api_secret="5hezjeytwyhwnhpkk8wmn6yx4s6f3dd43he8kftynug3snmzfcgukhuyrtsmfjdp")

channel = server_client.channel("messaging", "test_channel")


# channel.create(user_id)
# channel.update({"name": "my channel", "image": "image url", "mycustomfield": "123"})