from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from profiles.models import ArtistProfile, ClientProfile
from .models import SavedArtist
from .permissions import IsClientUser
from .serializers import SavedArtistSerializer

class SavedArtistListView(APIView):
    permission_classes = [IsClientUser]

    def get(self, request):
        client_profile = get_object_or_404(ClientProfile, user=request.user)

        queryset = (
            SavedArtist.objects
            .select_related("artist_profile")
            .filter(client_profile=client_profile)
        )

        serializer = SavedArtistSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class SaveArtistView(APIView):
    permission_classes = [IsClientUser]

    def post(self, request, artist_slug):
        print(request.user)
        client_profile = get_object_or_404(ClientProfile, user=request.user)

        artist_profile = get_object_or_404(
            ArtistProfile,
            slug=artist_slug
        )

        if SavedArtist.objects.filter(
            client_profile=client_profile,
            artist_profile=artist_profile
        ).exists():
            return Response(
                {"detail": "Artist already saved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        saved_artist = SavedArtist.objects.create(
            client_profile=client_profile,
            artist_profile=artist_profile
        )

        serializer = SavedArtistSerializer(saved_artist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class RemoveSavedArtistView(APIView):
    permission_classes = [IsClientUser]

    def delete(self, request, artist_slug):
        client_profile = get_object_or_404(ClientProfile, user=request.user)

        artist_profile = get_object_or_404(
            ArtistProfile,
            slug=artist_slug
        )

        saved_artist = SavedArtist.objects.filter(
            client_profile=client_profile,
            artist_profile=artist_profile
        ).first()

        if not saved_artist:
            return Response(
                {"detail": "Saved artist not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        saved_artist.delete()

        return Response(
            {"detail": "Artist removed from saved list."},
            status=status.HTTP_204_NO_CONTENT
        )