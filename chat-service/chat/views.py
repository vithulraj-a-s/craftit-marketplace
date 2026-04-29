from django.shortcuts import render
from .mongodb import get_messages_collection
from django.http import JsonResponse

# Create your views here.
from django.http import JsonResponse
from .mongodb import get_messages_collection


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