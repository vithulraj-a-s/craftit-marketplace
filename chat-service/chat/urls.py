from django.urls import path
from .views import get_messages

urlpatterns = [
    path("messages/<str:conversation_id>/", get_messages),
]