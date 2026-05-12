from pymongo import MongoClient
from django.conf import settings

_client = None
_db = None

def get_mongo_db():
    global _client, _db

    if _db is None:
        _client = MongoClient(settings.MONGO_URI)
        _db = _client[settings.MONGO_DB_NAME]

    return _db


def get_messages_collection():
    db = get_mongo_db()
    return db["messages"]

def get_participants_collection():
    db = get_mongo_db()
    return db["conversation_participants"]