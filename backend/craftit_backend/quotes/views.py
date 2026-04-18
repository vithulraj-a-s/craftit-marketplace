from django.shortcuts import render

# Create your views here.

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import ArtistProfile, ClientProfile
from .models import Quote
from .serializers import (
    QuoteCreateSerializer,
    QuoteSerializer,
    QuoteStatusUpdateSerializer,
)


class CreateQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "ARTIST":
            return Response(
                {"detail": "Only artists can create quotes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = QuoteCreateSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():
            quote = serializer.save()

            return Response(
                QuoteSerializer(quote).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class ArtistQuoteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "ARTIST":
            return Response(
                {"detail": "Only artists can view artist quotes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            artist_profile = ArtistProfile.objects.get(user=request.user)
        except ArtistProfile.DoesNotExist:
            return Response(
                {"detail": "Artist profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quotes = Quote.objects.filter(
            artist_profile=artist_profile
        ).select_related(
            "artist_profile",
            "portrait_request",
            "portrait_request__client_profile",
        ).order_by("-created_at")

        serializer = QuoteSerializer(quotes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClientQuoteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "CLIENT":
            return Response(
                {"detail": "Only clients can view client quotes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            client_profile = ClientProfile.objects.get(user=request.user)
        except ClientProfile.DoesNotExist:
            return Response(
                {"detail": "Client profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quotes = Quote.objects.filter(
            portrait_request__client_profile=client_profile
        ).select_related(
            "artist_profile",
            "portrait_request",
            "portrait_request__client_profile",
        ).order_by("-created_at")

        serializer = QuoteSerializer(quotes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuoteDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quote_id):
        try:
            quote = Quote.objects.select_related(
                "artist_profile",
                "portrait_request",
                "portrait_request__client_profile",
            ).get(id=quote_id)
        except Quote.DoesNotExist:
            return Response(
                {"detail": "Quote not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user.role == "ARTIST":
            try:
                artist_profile = ArtistProfile.objects.get(user=request.user)
            except ArtistProfile.DoesNotExist:
                return Response(
                    {"detail": "Artist profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if quote.artist_profile != artist_profile:
                return Response(
                    {"detail": "Not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        elif request.user.role == "CLIENT":
            try:
                client_profile = ClientProfile.objects.get(user=request.user)
            except ClientProfile.DoesNotExist:
                return Response(
                    {"detail": "Client profile not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if quote.portrait_request.client_profile != client_profile:
                return Response(
                    {"detail": "Not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        else:
            return Response(
                {"detail": "Invalid user role."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = QuoteSerializer(quote)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateQuoteStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, quote_id):
        if request.user.role != "CLIENT":
            return Response(
                {"detail": "Only clients can respond to quotes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            client_profile = ClientProfile.objects.get(user=request.user)
        except ClientProfile.DoesNotExist:
            return Response(
                {"detail": "Client profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            quote = Quote.objects.select_related(
                "portrait_request",
                "portrait_request__client_profile",
            ).get(id=quote_id)
        except Quote.DoesNotExist:
            return Response(
                {"detail": "Quote not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if quote.portrait_request.client_profile != client_profile:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if quote.status != Quote.Status.PENDING:
            return Response(
                {"detail": "This quote has already been processed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = QuoteStatusUpdateSerializer(
            quote,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                QuoteSerializer(quote).data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )