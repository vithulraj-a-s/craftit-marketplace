from django.shortcuts import render

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import (
    get_client_navbar_summary, get_artist_navbar_summary
)

from .serializers import (
    ClientNavbarSummarySerializer, ArtistNavbarSummarySerializer
) 


class ClientNavbarSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_client_navbar_summary(user=request.user)

        serializer = (ClientNavbarSummarySerializer(data))

        return Response(
            serializer.data
        )
    
class ArtistNavbarSummaryAPIView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        data = get_artist_navbar_summary(
            user=request.user
        )

        serializer = (
            ArtistNavbarSummarySerializer(
                data
            )
        )

        return Response(
            serializer.data
        )