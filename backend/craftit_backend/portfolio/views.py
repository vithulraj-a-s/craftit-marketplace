from django.shortcuts import render
from django.shortcuts import get_object_or_404

# Create your views here.

from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import ArtistProfile

from .models import PortfolioItem
from .permissions import IsPortfolioOwner
from .serializers import (
    PortfolioItemSerializer,
    PortfolioItemCreateUpdateSerializer,TrendingPortfolioSerializer
)

class PortfolioCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PortfolioItemCreateUpdateSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            portfolio_item = serializer.save()

            response_serializer = PortfolioItemSerializer(portfolio_item)

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ArtistPortfolioListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        artist_profile = get_object_or_404(ArtistProfile, slug=slug)

        portfolio_items = artist_profile.portfolio_items.all()

        serializer = PortfolioItemSerializer(
            portfolio_items,
            many=True
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class PortfolioUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        portfolio_item = get_object_or_404(PortfolioItem, pk=pk)

        permission = IsPortfolioOwner()
        if not permission.has_object_permission(request, self, portfolio_item):
            return Response(
                {"detail": "You do not have permission to edit this item."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PortfolioItemCreateUpdateSerializer(
            portfolio_item,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        if serializer.is_valid():
            portfolio_item = serializer.save()

            response_serializer = PortfolioItemSerializer(portfolio_item)

            return Response(
                response_serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PortfolioDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        portfolio_item = get_object_or_404(PortfolioItem, pk=pk)

        permission = IsPortfolioOwner()
        if not permission.has_object_permission(request, self, portfolio_item):
            return Response(
                {"detail": "You do not have permission to delete this item."},
                status=status.HTTP_403_FORBIDDEN
            )

        portfolio_item.delete()

        return Response(
            {"detail": "Portfolio item deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )
    
class TrendingPortfolioAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        queryset = (
            PortfolioItem.objects
            .select_related(
                "artist_profile"
            )
            .order_by(
                "-likes_count",
                "-created_at"
            )[:5]
        )

        serializer = TrendingPortfolioSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)