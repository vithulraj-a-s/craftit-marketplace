from rest_framework.permissions import BasePermission


class IsPortfolioOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.artist_profile.user == request.user