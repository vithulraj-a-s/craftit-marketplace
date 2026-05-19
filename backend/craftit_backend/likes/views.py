from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from portfolio.models import PortfolioItem

from likes.services import (
    like_portfolio_item,
    unlike_portfolio_item,
)


class LikePortfolioItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, portfolio_item_id):

        portfolio_item = get_object_or_404(
            PortfolioItem,
            id=portfolio_item_id,
        )

        like_portfolio_item(
            user=request.user,
            portfolio_item_id=portfolio_item.id,
        )

        portfolio_item.refresh_from_db()

        return Response(
            {
                "message": "Portfolio item liked successfully.",
                "likes_count": portfolio_item.likes_count,
            },
            status=status.HTTP_201_CREATED,
        )


class UnlikePortfolioItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, portfolio_item_id):

        portfolio_item = get_object_or_404(
            PortfolioItem,
            id=portfolio_item_id,
        )

        unlike_portfolio_item(
            user=request.user,
            portfolio_item_id=portfolio_item.id,
        )

        portfolio_item.refresh_from_db()

        return Response(
            {
                "message": "Portfolio item unliked successfully.",
                "likes_count": portfolio_item.likes_count,
            },
            status=status.HTTP_200_OK,
        )