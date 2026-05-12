from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from orders.models import Order
from orders.serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    OrderStatusUpdateSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from datetime import datetime
from .serializers import ArtistDashboardSerializer
from portrait_requests.models import PortraitRequest


class ClientOrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != "CLIENT":
            raise PermissionDenied("Only clients can access this endpoint.")

        return (
            Order.objects.filter(client_profile__user=self.request.user)
            .select_related(
                "quote",
                "quote__portrait_request",
                "artist_profile",
                "client_profile",
            )
            .order_by("-created_at")
        )
    
class ArtistOrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != "ARTIST":
            raise PermissionDenied("Only artists can access this endpoint.")

        return (
            Order.objects.filter(artist_profile__user=self.request.user)
            .select_related(
                "quote",
                "quote__portrait_request",
                "artist_profile",
                "client_profile",
            )
            .order_by("-created_at")
        )
    
class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]

    queryset = Order.objects.select_related(
        "quote",
        "quote__portrait_request",
        "artist_profile",
        "client_profile",
    )

    def get_object(self):
        order = super().get_object()

        user = self.request.user

        if (
            order.client_profile.user != user
            and order.artist_profile.user != user
        ):
            raise PermissionDenied(
                "You do not have permission to view this order."
            )

        return order
    
class OrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [IsAuthenticated]

    queryset = Order.objects.select_related(
        "artist_profile__user",
        "client_profile__user",
    )

    def get_object(self):
        order = super().get_object()

        user = self.request.user

        if (
            order.client_profile.user != user
            and order.artist_profile.user != user
        ):
            raise PermissionDenied(
                "You do not have permission to update this order."
            )

        return order

class ArtistDashboardView(APIView):
    def get(self, request):
        user = request.user

        if not hasattr(user, "artist_profile"):
            return Response({"error": "User is not an artist"}, status=400)

        artist = user.artist_profile

        all_orders = Order.objects.filter(artist_profile=artist)

        paid_orders = Order.objects.filter(
            artist_profile=artist,
            payment__status="success"
        )

        total_orders = all_orders.count()

        completed_orders = all_orders.filter(status="completed").count()
        in_progress_orders = all_orders.filter(status="in_progress").count()
        pending_orders = all_orders.filter(status="pending_payment").count()

        total_earnings = paid_orders.aggregate(
            total=Sum("payment__amount")
        )["total"] or 0


        earnings_by_month = (
            paid_orders
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("payment__amount"))
            .order_by("month")
        )

        earnings_chart = [
            {
                "month": item["month"].strftime("%b"),
                "earnings": item["total"]
            }
            for item in earnings_by_month
            if item["month"] is not None
        ]

        orders_distribution = {
            "completed": completed_orders,
            "pending": pending_orders,
            "in_progress": in_progress_orders
        }

        artist_requests = PortraitRequest.objects.filter(
            artist_profile=artist
        )

        pending_quotes = artist_requests.filter(
            quote__isnull=True
        ).count()

        total_requests = artist_requests.count()

        portrait_requests = {
            "pending_quotes": pending_quotes,
            "total_requests": total_requests
        }

        recent_orders = [
            {
                "id": item["id"],
                "status": item["status"],
                "price": item["payment__amount"]
            }
            for item in all_orders.order_by("-created_at").values(
                "id", "status", "payment__amount"
            )[:5]
        ]
        return Response({
            "overview": {
                "total_earnings": total_earnings,
                "total_orders": total_orders,
                "completed_orders": completed_orders,
                "pending_orders": pending_orders,
                "in_progress_orders": in_progress_orders
            },
            "earnings_chart": earnings_chart,
            "orders_distribution": orders_distribution,
            "portrait_requests": portrait_requests,
            "recent_activity": recent_orders
        })