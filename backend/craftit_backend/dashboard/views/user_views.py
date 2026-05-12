from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.models import User

from django.shortcuts import get_object_or_404

from dashboard.serializers import (
    UserListSerializer,UserUpdateSerializer
)

class UserListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if (
            not request.user.is_staff or
            "manage_users" not in
            request.user.staff_profile.permissions
        ):
            return Response(
                {"detail": "Permission denied"},
                status=403
            )

        users = User.objects.filter(
            is_staff=False
        ).order_by("-created_at")

        search = request.GET.get("search")
        role = request.GET.get("role")
        verified = request.GET.get("verified")
        active = request.GET.get("active")

        if search:
            users = users.filter(
                email__icontains=search
            )

        if role:
            users = users.filter(
                role=role.upper()
            )

        if verified is not None:
            users = users.filter(
                is_verified=verified.lower() == "true"
            )

        if active is not None:
            users = users.filter(
                is_active=active.lower() == "true"
            )

        serializer = UserListSerializer(
            users,
            many=True
        )

        return Response(serializer.data)
    
class UserUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):

        if (
            not request.user.is_staff or
            "manage_users" not in
            request.user.staff_profile.permissions
        ):
            return Response(
                {"detail": "Permission denied"},
                status=403
            )

        user = get_object_or_404(
            User,
            id=user_id,
            is_staff=False
        )

        serializer = UserUpdateSerializer(
            instance=user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response({
            "message": "User updated successfully"
        })