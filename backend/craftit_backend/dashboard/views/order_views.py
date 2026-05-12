from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db.models import Q

from django.shortcuts import get_object_or_404

from orders.models import Order

from dashboard.serializers import (
    OrderListSerializer,OrderUpdateSerializer
)


class OrderListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if (
            not request.user.is_staff or
            "manage_orders" not in
            request.user.staff_profile.permissions
        ):
            return Response(
                {"detail": "Permission denied"},
                status=403
            )

        orders = Order.objects.select_related(
            "client_profile__user",
            "artist_profile__user",
            "payment"
        ).order_by("-created_at")

        search = request.GET.get("search")
        status_filter = request.GET.get("status")

        if search:

            orders = orders.filter(
                Q(
                    client_profile__user__email__icontains=search
                ) |
                Q(
                    artist_profile__user__email__icontains=search
                )
            )

        if status_filter:

            orders = orders.filter(
                status=status_filter
            )

        serializer = OrderListSerializer(
            orders,
            many=True
        )

        return Response(serializer.data)
    
class OrderUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):

        if (
            not request.user.is_staff or
            "manage_orders" not in
            request.user.staff_profile.permissions
        ):
            return Response(
                {"detail": "Permission denied"},
                status=403
            )

        order = get_object_or_404(
            Order,
            id=order_id
        )

        serializer = OrderUpdateSerializer(
            instance=order,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response({
            "message": "Order updated successfully"
        })