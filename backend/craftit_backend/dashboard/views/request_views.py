from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db.models import Q

from portrait_requests.models import PortraitRequest

from dashboard.serializers import (
    RequestListSerializer
)


class RequestListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if (
            not request.user.is_staff or
            "manage_requests" not in
            request.user.staff_profile.permissions
        ):
            return Response(
                {"detail": "Permission denied"},
                status=403
            )

        requests = PortraitRequest.objects.select_related(
            "client_profile__user",
            "artist_profile__user"
        ).order_by("-created_at")

        search = request.GET.get("search")
        status_filter = request.GET.get("status")
        style_filter = request.GET.get("style")

        if search:

            requests = requests.filter(
                Q(title__icontains=search) |
                Q(
                    client_profile__user__email__icontains=search
                ) |
                Q(
                    artist_profile__user__email__icontains=search
                )
            )

        if status_filter:

            requests = requests.filter(
                status=status_filter
            )

        if style_filter:

            requests = requests.filter(
                portrait_style__iexact=style_filter
            )

        serializer = RequestListSerializer(
            requests,
            many=True
        )

        return Response(serializer.data)