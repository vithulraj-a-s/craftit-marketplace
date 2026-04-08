from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import ClientProfile, ArtistProfile
from .models import PortraitRequest
from .permissions import IsClientUser, IsArtistUser
from .serializers import (PortraitRequestCreateSerializer,PortraitRequestSerializer)

class CreatePortraitRequestView(APIView):
    permission_classes = [IsAuthenticated, IsClientUser]

    def post(self, request):
        try:
            ClientProfile.objects.get(user=request.user)
        except ClientProfile.DoesNotExist:
            return Response(
                {"detail": "Client profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PortraitRequestCreateSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            portrait_request = serializer.save()

            response_serializer = PortraitRequestSerializer(portrait_request)

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ClientPortraitRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsClientUser]

    def get(self, request):
        try:
            client_profile = ClientProfile.objects.get(user=request.user)
        except ClientProfile.DoesNotExist:
            return Response(
                {"detail": "Client profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        requests = (
            PortraitRequest.objects
            .filter(client_profile=client_profile)
            .select_related("artist_profile", "client_profile")
            .order_by("-created_at")
        )

        serializer = PortraitRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ArtistPortraitRequestListView(APIView):
    permission_classes = [IsAuthenticated, IsArtistUser]

    def get(self, request):
        try:
            artist_profile = ArtistProfile.objects.get(user=request.user)
        except ArtistProfile.DoesNotExist:
            return Response(
                {"detail": "Artist profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        requests = (
            PortraitRequest.objects
            .filter(artist_profile=artist_profile)
            .select_related("artist_profile", "client_profile")
            .order_by("-created_at")
        )

        serializer = PortraitRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class PortraitRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, request_id):
        portrait_request = get_object_or_404(
            PortraitRequest.objects.select_related(
                "artist_profile",
                "client_profile",
            ),
            id=request_id,
        )

        if request.user.role == "CLIENT":
            try:
                client_profile = ClientProfile.objects.get(user=request.user)
            except ClientProfile.DoesNotExist:
                return Response(
                    {"detail": "Client profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if portrait_request.client_profile != client_profile:
                return Response(
                    {"detail": "Not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        elif request.user.role == "ARTIST":
            try:
                artist_profile = ArtistProfile.objects.get(user=request.user)
            except ArtistProfile.DoesNotExist:
                return Response(
                    {"detail": "Artist profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if portrait_request.artist_profile != artist_profile:
                return Response(
                    {"detail": "Not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        else:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PortraitRequestSerializer(portrait_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UpdatePortraitRequestStatusView(APIView):
    permission_classes = [IsAuthenticated, IsArtistUser]

    def patch(self, request, request_id):
        try:
            artist_profile = ArtistProfile.objects.get(user=request.user)
        except ArtistProfile.DoesNotExist:
            return Response(
                {"detail": "Artist profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        portrait_request = get_object_or_404(
            PortraitRequest,
            id=request_id,
            artist_profile=artist_profile,
        )

        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"detail": "Status field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_status = new_status.lower()

        allowed_statuses = [
            PortraitRequest.Status.ACCEPTED,
            PortraitRequest.Status.REJECTED,
        ]

        if new_status not in allowed_statuses:
            return Response(
                {
                    "detail": "Status must be either 'accepted' or 'rejected'."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if portrait_request.status != PortraitRequest.Status.PENDING:
            return Response(
                {
                    "detail": "This request has already been processed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        portrait_request.status = new_status
        portrait_request.save(update_fields=["status", "updated_at"])

        serializer = PortraitRequestSerializer(portrait_request)

        return Response(serializer.data, status=status.HTTP_200_OK)