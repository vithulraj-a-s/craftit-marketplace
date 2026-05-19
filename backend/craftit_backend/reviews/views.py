from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from reviews.pagination import ArtistReviewPagination
from rest_framework.permissions import AllowAny

from .serializers import CreateArtistReviewSerializer, ArtistReviewResponseSerializer
from .services import create_review,update_review, delete_review, get_order_review
from reviews.serializers import UpdateArtistReviewSerializer

from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView

from profiles.models import ArtistProfile
from reviews.models import ArtistReview

class CreateArtistReviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateArtistReviewSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        review = create_review(
            user=request.user,
            order_id=serializer.validated_data["order_id"],
            rating=serializer.validated_data["rating"],
            review_text=serializer.validated_data["review"],
        )

        response_serializer = ArtistReviewResponseSerializer(review)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )
    
class ArtistReviewListAPIView(ListAPIView):

    serializer_class = ArtistReviewResponseSerializer

    permission_classes = [AllowAny]

    pagination_class = ArtistReviewPagination

    def get_queryset(self):

        artist_id = self.kwargs["artist_id"]

        return ArtistReview.objects.filter(
            artist_id=artist_id
        ).select_related(
            "reviewer",
            "artist",
            "order",
        ).order_by("-created_at")
    
class UpdateArtistReviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, review_id):
        review = get_object_or_404(
            ArtistReview.objects.select_related(
                "reviewer",
                "artist",
            ),
            id=review_id,
        )

        serializer = UpdateArtistReviewSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        updated_review = update_review(
            user=request.user,
            review=review,
            rating=serializer.validated_data.get("rating"),
            review_text=serializer.validated_data.get("review"),
        )

        response_serializer = (
            ArtistReviewResponseSerializer(updated_review)
        )

        return Response(response_serializer.data)
    
class DeleteArtistReviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, review_id):
        review = get_object_or_404(
            ArtistReview.objects.select_related(
                "reviewer",
                "artist",
            ),
            id=review_id,
        )

        delete_review(
            user=request.user,
            review=review,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
    

class OrderReviewDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):

        review = get_order_review(
            order_id=order_id
        )

        order = review.order

        is_client = (
            order.client_profile.user == request.user
        )

        is_artist = (
            order.artist_profile.user == request.user
        )

        if not (is_client or is_artist):
            raise ValidationError(
                "You do not have permission to view this review."
            )

        serializer = ArtistReviewResponseSerializer(
            review
        )

        return Response(serializer.data)