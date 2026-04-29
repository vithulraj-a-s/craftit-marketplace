from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .mongodb import get_messages_collection
from datetime import datetime
import json


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]

        # if self.user.is_anonymous:
        #     print("Unauthorized connection")
        #     self.close()
        #     return

        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"chat_{self.conversation_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        print(f"[CONNECT] User {self.user.id} joined {self.room_group_name}")
        self.accept()

    def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name,
                self.channel_name
            )
            print(f"[DISCONNECT] User {self.user.id} left {self.room_group_name}")

    def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            print("Invalid JSON received")
            return

        message = data.get("message")

        if not message:
            print("Empty message ignored")
            return

        messages_collection = get_messages_collection()

        sender_role = getattr(self.user, "role", "client")

        saved_message = {
            "conversation_id": self.conversation_id,
            "sender_id": self.user.id,
            "sender_role": sender_role,
            "message": message,
            "created_at": datetime.utcnow().isoformat()
        }

        result = messages_collection.insert_one(saved_message)
        saved_message["_id"] = str(result.inserted_id)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": saved_message
            }
        )

    def chat_message(self, event):
        self.send(text_data=json.dumps(event["message"]))