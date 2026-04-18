from rest_framework import serializers
from .models import PortraitRequest
from profiles.models import ArtistProfile, ClientProfile
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

    def validate(self, attrs):
        print(attrs)
        request = self.context["request"]
        print(request)
        artist_slug = attrs.get("artist_slug")

        try:
            artist_profile = ArtistProfile.objects.get(slug=artist_slug)
        except ArtistProfile.DoesNotExist:
            raise serializers.ValidationError({
                "artist_slug": "Artist not found."
            })

        if not artist_profile.is_available_for_commission:
            raise serializers.ValidationError({
                "artist_slug": "This artist is not currently accepting commissions."
            })

        attrs["artist_profile"] = artist_profile
        return attrs

    def create(self, validated_data):
        request = self.context["request"]

        validated_data.pop("artist_slug")
        artist_profile = validated_data.pop("artist_profile")

        try:
            client_profile = ClientProfile.objects.get(user=request.user)
        except ClientProfile.DoesNotExist:
            raise serializers.ValidationError({
                "detail": "Client profile not found."
            })

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
    
