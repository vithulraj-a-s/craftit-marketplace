from rest_framework import serializers

from .models import PortfolioItem


class PortfolioItemSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = PortfolioItem
        fields = [
            "id",
            "title",
            "description",
            "portrait_style",
            "image",
            "is_featured",
            "created_at",
            "updated_at",
            "likes_count",
        ]


class PortfolioItemCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = [
            "title",
            "description",
            "portrait_style",
            "image",
            "is_featured",
        ]

    def validate_portrait_style(self, value):
        return value.lower()

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        if user.role != "ARTIST":
            raise serializers.ValidationError(
                "Only artists can manage portfolio items."
            )

        try:
            artist_profile = user.artist_profile
        except Exception:
            raise serializers.ValidationError(
                "Artist profile must be completed first."
            )

        style = attrs.get(
            "portrait_style",
            getattr(self.instance, "portrait_style", None)
        )

        if style not in artist_profile.portrait_styles:
            raise serializers.ValidationError({
                "portrait_style": "This style is not available in your profile."
            })

        return attrs

    def create(self, validated_data):
        artist_profile = self.context["request"].user.artist_profile
        return PortfolioItem.objects.create(
            artist_profile=artist_profile,
            **validated_data
        )
    
class TrendingPortfolioSerializer(serializers.ModelSerializer):

    artist = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioItem

        fields = [
            "id",
            "image",
            "likes_count",
            "artist"
        ]

    def get_artist(self, obj):
        return {
            "id": obj.artist_profile.id,
            "display_name": obj.artist_profile.display_name,
            "slug": obj.artist_profile.slug,
            "profile_image": (
                obj.artist_profile.profile_image.url
                if obj.artist_profile.profile_image
                else None
            )
        }