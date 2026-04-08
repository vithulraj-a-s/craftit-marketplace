from rest_framework.permissions import BasePermission


class IsClientUser(BasePermission):
    message = "Only clients can save artists."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "CLIENT"
        )