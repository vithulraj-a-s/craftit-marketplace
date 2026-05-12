from django.urls import path
from .views import get_messages, get_conversations, mark_as_read

urlpatterns = [
    path("messages/<str:conversation_id>/", get_messages),
    path("mark-as-read/<str:conversation_id>/", mark_as_read),
    path("conversations/", get_conversations),
]