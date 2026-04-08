from rest_framework import serializers
from .models import SavedArtist


class SavedArtistSerializer(serializers.ModelSerializer):
    artist = serializers.SerializerMethodField()
    saved_at = serializers.DateTimeField(source="created_at")

    class Meta:
        model = SavedArtist
        fields = ["id", "artist", "saved_at"]

    def get_artist(self, obj):
        artist = obj.artist_profile

        return {
            "display_name": artist.display_name,
            "slug": artist.slug,
            "profile_image": artist.profile_image.url if artist.profile_image else None,
            "base_price": artist.base_price,
            "location": artist.location,
            "portrait_styles": artist.portrait_styles,
            "is_available_for_commission": artist.is_available_for_commission,
        }