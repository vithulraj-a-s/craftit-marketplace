from rest_framework import serializers
from .models import PortraitRequest
from profiles.models import ArtistProfile


class PortraitRequestCreateSerializer(serializers.ModelSerializer):
    artist_slug = serializers.CharField(write_only=True)

    class Meta:
        model = PortraitRequest
        fields = [
            "artist_slug",
            "title",
            "description",
            "portrait_style",
            "reference_image",
            "budget",
            "expected_delivery_date",
        ]

    def validate_artist_slug(self, value):
        try:
            artist = ArtistProfile.objects.get(slug=value)
        except ArtistProfile.DoesNotExist:
            raise serializers.ValidationError("Artist not found.")

        if not artist.is_available_for_commission:
            raise serializers.ValidationError(
                "This artist is not currently accepting commissions."
            )

        return value

    def create(self, validated_data):
        request = self.context["request"]

        artist_slug = validated_data.pop("artist_slug")
        artist_profile = ArtistProfile.objects.get(slug=artist_slug)

        client_profile = request.user.client_profile

        return PortraitRequest.objects.create(
            client_profile=client_profile,
            artist_profile=artist_profile,
            **validated_data,
        )
    
class PortraitRequestSerializer(serializers.ModelSerializer):
    artist = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()

    class Meta:
        model = PortraitRequest
        fields = [
            "id",
            "title",
            "description",
            "portrait_style",
            "reference_image",
            "budget",
            "expected_delivery_date",
            "status",
            "artist",
            "client",
            "created_at",
        ]

    def get_artist(self, obj):
        return {
            "display_name": obj.artist_profile.display_name,
            "slug": obj.artist_profile.slug,
            "profile_image": obj.artist_profile.profile_image.url if obj.artist_profile.profile_image else None,
        }

    def get_client(self, obj):
        return {
            "full_name": obj.client_profile.full_name,
            "profile_image": obj.client_profile.profile_image.url if obj.client_profile.profile_image else None,
        }