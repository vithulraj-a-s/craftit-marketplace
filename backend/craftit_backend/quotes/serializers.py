from rest_framework import serializers
from profiles.models import ArtistProfile
from portrait_requests.models import PortraitRequest
from .models import Quote


class QuoteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = [
            "portrait_request",
            "amount",
            "delivery_days",
            "message",
        ]

    def validate(self, attrs):
        request = self.context["request"]
        portrait_request = attrs.get("portrait_request")

        try:
            artist_profile = ArtistProfile.objects.get(user=request.user)
        except ArtistProfile.DoesNotExist:
            raise serializers.ValidationError({
                "detail": "Artist profile not found."
            })

        if portrait_request.artist_profile != artist_profile:
            raise serializers.ValidationError({
                "portrait_request": (
                    "You can only create quotes for your own portrait requests."
                )
            })

        if self.instance is None:
            if portrait_request.status != PortraitRequest.Status.PENDING:
                raise serializers.ValidationError({
                    "portrait_request": (
                        "Quotes can only be created for pending portrait requests."
                    )
                })

        attrs["artist_profile"] = artist_profile
        return attrs
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than 0."
            )
        return value

    def validate_delivery_days(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Delivery days must be greater than 0."
            )
        return value

    def create(self, validated_data):
        artist_profile = validated_data.pop("artist_profile")

        return Quote.objects.create(
            artist_profile=artist_profile,
            **validated_data
        )


class QuoteSerializer(serializers.ModelSerializer):
    portrait_request_id = serializers.IntegerField(
        source="portrait_request.id",
        read_only=True,
    )

    client = serializers.SerializerMethodField()
    artist = serializers.SerializerMethodField()

    class Meta:
        model = Quote
        fields = [
            "id",
            "portrait_request_id",
            "amount",
            "delivery_days",
            "message",
            "status",
            "client",
            "artist",
            "created_at",
            "updated_at",
        ]

    def get_client(self, obj):
        client_profile = obj.portrait_request.client_profile

        return {
            "full_name": client_profile.full_name,
            "profile_image": (
                client_profile.profile_image.url
                if client_profile.profile_image
                else None
            ),
        }

    def get_artist(self, obj):
        artist_profile = obj.artist_profile

        return {
            "display_name": artist_profile.display_name,
            "slug": artist_profile.slug,
            "profile_image": (
                artist_profile.profile_image.url
                if artist_profile.profile_image
                else None
            ),
        }


class QuoteStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ["status"]

    def validate_status(self, value):
        value = value.lower()

        if value not in [
            Quote.Status.ACCEPTED,
            Quote.Status.REJECTED,
        ]:
            raise serializers.ValidationError(
                "Status must be either 'accepted' or 'rejected'."
            )

        return value