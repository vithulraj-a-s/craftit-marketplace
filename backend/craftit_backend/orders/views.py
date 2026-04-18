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