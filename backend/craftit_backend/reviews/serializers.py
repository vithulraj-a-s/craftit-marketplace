from rest_framework import serializers

from .models import ArtistReview


class CreateArtistReviewSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()

    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
    )

    review = serializers.CharField(
        max_length=2000,
        trim_whitespace=True,
    )

class ArtistReviewResponseSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(
        source="order.id",
        read_only=True,
    )
    reviewer_name = serializers.CharField(
        source="reviewer.full_name",
        read_only=True,
    )

    artist_name = serializers.CharField(
        source="artist.display_name",
        read_only=True,
    )

    class Meta:
        model = ArtistReview

        fields = [
            "id",
            "order_id",
            "reviewer_name",
            "artist_name",
            "rating",
            "review",
            "created_at",
        ]

class UpdateArtistReviewSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1,max_value=5,required=False)

    review = serializers.CharField(max_length=2000,required=False,trim_whitespace=True)