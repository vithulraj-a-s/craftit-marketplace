from django.urls import path
from .views import ChatFileUploadView

urlpatterns = [
    path(
        "upload/",
        ChatFileUploadView.as_view(),
        name="chat-upload"
    ),
]