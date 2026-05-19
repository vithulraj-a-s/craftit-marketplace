from django.urls import re_path
from .consumers import ChatConsumer

print("ROUTING FILE LOADED")
websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<conversation_id>[^/]+)/$", ChatConsumer.as_asgi()),
    re_path(r"^ws/notifications/$", ChatConsumer.as_asgi()),
    ]