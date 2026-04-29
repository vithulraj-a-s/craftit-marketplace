from django.shortcuts import render

# Create your views here.
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import filters, status

from profiles.models import ArtistProfile, ClientProfile
from profiles.serializers import (ArtistProfileListSerializer,
                                    ArtistProfileDetailSerializer,
                                    ArtistProfileUpdateSerializer,
                                    ClientProfileSerializer,
                                    ArtistProfileCreateSerializer,
                                    ClientProfileCreateSerializer)
from profiles.filters import ArtistProfileFilter

from rest_framework.permissions import IsAuthenticated, AllowAny
from profiles.permissions import IsArtist, IsClient
from .pagination import ArtistPagination


class ArtistListView(APIView):
    permission_classes = [AllowAny]
    filter_backends = [
        DjangoFilterBackend(),
        filters.SearchFilter(),
    ]

    filterset_class = ArtistProfileFilter

    search_fields = ["display_name","location","short_bio"]

    pagination_class = ArtistPagination
    
    def get(self, request):
        queryset = ArtistProfile.objects.filter(
            is_available_for_commission=True
        ).order_by("-created_at")

        for backend in self.filter_backends:
            queryset = backend.filter_queryset(
                request=request,
                queryset=queryset,
                view=self,
            )

        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request,
            view=self
        )

        serializer = ArtistProfileListSerializer(paginated_queryset, many=True)

        return paginator.get_paginated_response(serializer.data)    

class ArtistDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, slug):
        try:
            artist = ArtistProfile.objects.select_related("user").get(slug=slug)
        except ArtistProfile.DoesNotExist:
            return Response(
                {"detail": "Artist not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ArtistProfileDetailSerializer(artist)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class ArtistMeView(APIView):
    permission_classes = [IsAuthenticated, IsArtist]

    def get_object(self, user):
        return ArtistProfile.objects.filter(user=user).first()

    def get(self, request):
        artist = self.get_object(request.user)

        if not artist:
            return Response(
                {"detail": "Artist profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ArtistProfileDetailSerializer(artist)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        existing_profile = self.get_object(request.user)

        if existing_profile:
            return Response(
                {"detail": "Artist profile already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ArtistProfileCreateSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        artist = self.get_object(request.user)

        if not artist:
            return Response(
                {"detail": "Artist profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ArtistProfileUpdateSerializer(
            artist,
            data=request.data,
            partial=True,
        )

        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ClientMeView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def get_object(self, user):
        return ClientProfile.objects.filter(user=user).first()

    def get(self, request):
        client = self.get_object(request.user)

        if not client:
            return Response(
                {"detail": "Client profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ClientProfileSerializer(client)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        existing_profile = self.get_object(request.user)

        if existing_profile:
            return Response(
                {"detail": "Client profile already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ClientProfileCreateSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        client = self.get_object(request.user)

        if not client:
            return Response(
                {"detail": "Client profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ClientProfileSerializer(
            client,
            data=request.data,
            partial=True,
        )

        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)