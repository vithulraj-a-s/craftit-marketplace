from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from dashboard.serializers import StaffCreateSerializer,StaffUpdateSerializer,StaffListSerializer
from users.models import User


class StaffCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if (
            not request.user.is_staff or
            request.user.staff_profile.role != "SUPER_ADMIN"
        ):
            return Response(
                {"detail": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = StaffCreateSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "message": "Staff created successfully"
            },
            status=status.HTTP_201_CREATED
        )
    
class StaffUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):

        if (
            not request.user.is_staff or
            request.user.staff_profile.role != "SUPER_ADMIN"
        ):
            return Response(
                {"detail": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        user = get_object_or_404(
            User,
            id=user_id,
            is_staff=True
        )

        serializer = StaffUpdateSerializer(
            instance=user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response({
            "message": "Staff updated successfully"
        })
    
class StaffToggleView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):

        if (
            not request.user.is_staff or
            request.user.staff_profile.role != "SUPER_ADMIN"
        ):
            return Response(
                {"detail": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.id == user_id:
            return Response(
                {
                    "detail": "You cannot deactivate your own account"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(
            User,
            id=user_id,
            is_staff=True
        )

        staff_profile = user.staff_profile

        new_status = not staff_profile.is_active_staff

        staff_profile.is_active_staff = new_status
        staff_profile.save()

        user.is_active = new_status
        user.save()

        return Response({
            "message": (
                "Staff activated successfully"
                if new_status
                else
                "Staff deactivated successfully"
            ),
            "is_active_staff": new_status
        })
    
class StaffListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if (
            not request.user.is_staff or
            request.user.staff_profile.role != "SUPER_ADMIN"
        ):
            return Response(
                {"detail": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        staff_users = User.objects.filter(
            is_staff=True
        ).select_related(
            "staff_profile"
        ).order_by("-created_at")

        serializer = StaffListSerializer(
            staff_users,
            many=True
        )

        return Response(serializer.data)