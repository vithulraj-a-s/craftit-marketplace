from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .mongodb import get_messages_collection,get_participants_collection
from datetime import datetime
import json

import logging
logger = logging.getLogger(__name__)

print("CONSUMERS FILE LOADED")
class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]

        print("==== NEW SOCKET CONNECTION ====")
        print("SCOPE USER:", self.user)

        if not self.user or not getattr(self.user, "is_authenticated", False):
            print("Anonymus user")
            self.close()
            return
        
        # print("User: ", self.user.id)

        self.user_group_name = f"user_{self.user.id}"
        # print("JOINING USER GROUP:", self.user_group_name)

        async_to_sync(self.channel_layer.group_add)(
            self.user_group_name,
            self.channel_name
        )

        self.conversation_id = self.scope["url_route"]["kwargs"].get("conversation_id")

        if self.conversation_id:
            self.room_group_name = f"chat_{self.conversation_id}"

            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )

            print(f"[CONNECT] Chat user {self.user.id} joined {self.room_group_name}")

        else:
            print(f"[CONNECT] Notification socket for user {self.user.id}")

        self.accept()

    def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name,
                self.channel_name
            )
        
        if hasattr(self, "user_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.user_group_name,
                self.channel_name
            )

        print(f"[DISCONNECT] User {self.user.id}")

    def receive(self, text_data):
        
        try:
            print("🚀 RECEIVE HIT")
            print("📩 RAW DATA:", text_data)
            try:
                data = json.loads(text_data)
            except json.JSONDecodeError:
                return
            
            message_type = data.get("type","text")
            message = data.get("message","")
            file_url = data.get("file_url","")
            file_name = data.get("file_name", "")
            receiver_id = data.get("receiver_id")
            print("🎯 RECEIVER ID:", receiver_id)
            print("🧠 CONVERSATION ID:", getattr(self, "conversation_id", None))

            if message_type == "typing":
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        "type": "typing_event",
                        "sender_id": self.user.id
                    }
                )
                return
            
            if message_type == "stop_typing":
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        "type": "stop_typing_event",
                        "sender_id": self.user.id
                    }
                )

                return

            if(not message and not file_url):
                return

            messages_collection = get_messages_collection()
            # participants_collection = get_participants_collection()

            sender_role = getattr(self.user, "role", "client")
            participants_collection = get_participants_collection()

            print("SELF USER ID TYPE:", type(self.user.id))
            print("RECEIVER ID TYPE:", type(receiver_id))
            print("CONVERSATION ID:", self.conversation_id)

            # Ensure sender exists
            participants_collection.update_one(
                {
                    "conversation_id": str(self.conversation_id),
                    "user_id": self.user.id
                },
                {
                    "$setOnInsert": {
                        "role": sender_role,
                        "last_read_at": datetime.utcnow(),
                        "unread_count": 0
                    }
                },
                upsert=True
            )

            # Ensure receiver exists
            participants_collection.update_one(
                {
                    "conversation_id": str(self.conversation_id),
                    "user_id": receiver_id
                },
                {
                    "$setOnInsert": {
                        "role": "CLIENT" if sender_role == "ARTIST" else "ARTIST",
                        "last_read_at": datetime.utcnow(),
                        "unread_count": 0
                    }
                },
                upsert=True
            )

            saved_message = {
                "conversation_id": str(self.conversation_id),
                "sender_id": self.user.id,
                "sender_role": sender_role,
                "type": message_type,
                "message": message,
                "file_url":file_url,
                "file_name":file_name,
                "created_at": datetime.utcnow()
            }

            result = messages_collection.insert_one(saved_message)
            print("✅ MESSAGE SAVED")

            saved_message["_id"] = str(result.inserted_id)
            saved_message["created_at"] = saved_message["created_at"].isoformat()

            print("🔥 STARTING UNREAD UPDATE")
            participants_collection.update_many(
                {
                    "conversation_id": str(self.conversation_id),
                    "user_id": {"$ne": self.user.id}
                },
                {
                    "$inc": {"unread_count": 1}
                }
            )
            print("✅ UNREAD INCREMENT DONE")

            participants_collection.update_one(
                {
                    "conversation_id": str(self.conversation_id),
                    "user_id": self.user.id
                },
                {
                    "$set": {
                        "last_read_at": datetime.utcnow(),
                        "unread_count": 0
                    }
                }
            )
            print("✅ SENDER RESET DONE")

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": saved_message
                }
            )

            print("🔥 CURRENT USER:", self.user.id)

            print("🔥 FETCHING RECEIVER PARTICIPANT")
            participant_data = participants_collection.find_one({
                "conversation_id": str(self.conversation_id),
                "user_id": receiver_id
            })

            print("🔥 RECEIVER PARTICIPANT:", participant_data)

            async_to_sync(self.channel_layer.group_send)(
                f"user_{receiver_id}",
                {
                    "type": "notify_user",
                    "conversation_id": str(self.conversation_id),
                    "unread_count": participant_data["unread_count"]
                }
            )

            print("✅ UNREAD EVENT SENT")
        except Exception as e:
            print("❌ RECEIVE ERROR:", str(e))
            import traceback
            traceback.print_exc()
        

        # participants = list(participants_collection.find({
        #     "conversation_id": str(self.conversation_id)
        # }))
        # print("🔥 PARTICIPANTS:", participants) # this block is done for the entire changes after git push


        # for participant in participants:
        #     print("👀 CHECKING PARTICIPANT:", participant)


        #     if participant["user_id"] != self.user.id:
        #         print("✅ TARGET FOUND")

        #         target_user_id = participant["user_id"]

        #         print("🎯 TARGET USER:", target_user_id)

        #         participant_data = participants_collection.find_one({
        #             "conversation_id": str(self.conversation_id),
        #             "user_id": target_user_id
        #         })

        #         print("SENDING UNREAD EVENT TO:", f"user_{target_user_id}")

        #         async_to_sync(self.channel_layer.group_send)(
        #             f"user_{target_user_id}",
        #             {
        #                 "type": "notify_user",
        #                 "conversation_id": str(self.conversation_id),
        #                 "unread_count": participant_data["unread_count"]
        #             }
        #         )


    def chat_message(self, event):
        self.send(text_data=json.dumps({
            "type": "chat_message",
            "data": event["message"]
        }))
    
    def typing_event(self, event):
        if event["sender_id"] == self.user.id:
            return
        
        self.send(text_data=json.dumps({
            "type": "typing",
            "sender_id": event["sender_id"]
        }))


    def stop_typing_event(self, event):

        if event["sender_id"] == self.user.id:
            return

        self.send(text_data=json.dumps({
            "type": "stop_typing",
            "sender_id": event["sender_id"]
        }))

    def unread_update(self, event):
        if self.user.id != event["sender_id"]:
            self.send(text_data=json.dumps({
                "type": "unread_update",
                "conversation_id": event["conversation_id"]
            }))
            
    def notify_user(self, event):
        print("🔥 NOTIFY USER EVENT:", event)

        self.send(text_data=json.dumps({
            "type": "unread_update",
            "conversation_id": event["conversation_id"],
            "unread_count": event["unread_count"]
        }))