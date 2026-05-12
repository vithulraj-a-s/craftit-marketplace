from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from django.core.files.storage import default_storage


class ChatFileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):

        file = request.FILES.get("file")

        if not file:
            return Response(
                {"error": "No file uploaded"},
                status=status.HTTP_400_BAD_REQUEST
            )

        file_path = default_storage.save(
            f"chat/{file.name}",
            file
        )

        file_url = default_storage.url(file_path)

        return Response({
            "file_url": file_url,
            "file_name": file.name
        })