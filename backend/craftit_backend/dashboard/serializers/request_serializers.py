from rest_framework import serializers

from portrait_requests.models import PortraitRequest


class RequestListSerializer(serializers.ModelSerializer):

    client_email = serializers.CharField(
        source="client_profile.user.email"
    )

    artist_email = serializers.CharField(
        source="artist_profile.user.email"
    )

    class Meta:
        model = PortraitRequest

        fields = [
            "id",
            "title",
            "portrait_style",
            "status",
            "budget",
            "client_email",
            "artist_email",
            "created_at",
        ]