from django.shortcuts import render
from .mongodb import get_messages_collection
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime
from .mongodb import get_participants_collection
# Create your views here.


def get_messages(request, conversation_id):
    messages_collection = get_messages_collection()

    messages = []

    cursor = messages_collection.find(
        {"conversation_id": conversation_id}
    ).sort("created_at", 1)

    for msg in cursor:
        msg["_id"] = str(msg["_id"])
        messages.append(msg)

    return JsonResponse(messages, safe=False)


@api_view(["POST"])
def mark_as_read(request, conversation_id):
    participants_collection = get_participants_collection()

    user_id = request.data.get("user_id")

    if not user_id:
        return Response({"error": "user_id required"}, status=400)

    result = participants_collection.update_one(
        {
            "conversation_id": str(conversation_id),
            "user_id": int(user_id)
        },
        {
            "$set": {
                "last_read_at": datetime.utcnow(),
                "unread_count": 0
            }
        }
    )

    return Response({
        "message": "Marked as read",
        "modified_count": result.modified_count
    })


@api_view(["GET"])
def get_conversations(request):
    participants_collection = get_participants_collection()

    user_id = request.GET.get("user_id")

    if not user_id:
        return Response({"error": "user_id required"}, status=400)

    user_id = int(user_id)

    conversations = participants_collection.find(
        {"user_id": user_id},
        {
            "_id": 0,
            "conversation_id": 1,
            "unread_count": 1
        }
    )

    return Response(list(conversations))