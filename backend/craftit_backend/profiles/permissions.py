from rest_framework.permissions import BasePermission


class IsArtist(BasePermission):
    message = "Only artists can access this endpoint."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "ARTIST"
        )


class IsClient(BasePermission):
    message = "Only clients can access this endpoint."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "CLIENT"
        )