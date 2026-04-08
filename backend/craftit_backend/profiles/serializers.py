from rest_framework import serializers
from profiles.models import ArtistProfile, ClientProfile

class ArtistProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistProfile
        fields = [
            "display_name",
            "profile_image",
            "short_bio",
            "location",
            "base_price",
            "years_of_experience",
            "portrait_styles",
            "min_delivery_days",
            "max_delivery_days",
            "is_available_for_commission",
        ]

    def validate(self, attrs):
        if attrs["min_delivery_days"] > attrs["max_delivery_days"]:
            raise serializers.ValidationError(
                "min_delivery_days cannot be greater than max_delivery_days."
            )

        return attrs
    
    
class ClientProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = [
            "full_name",
            "profile_image",
        ]


class ArtistProfileListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistProfile
        fields = [
            "display_name",
            "slug",
            "profile_image",
            "short_bio",
            "location",
            "base_price",
            "portrait_styles",
            "min_delivery_days",
            "max_delivery_days",
            "average_rating",
            "total_reviews",
            "total_completed_orders",
            "is_available_for_commission",
        ]



class ArtistProfileDetailSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ArtistProfile
        fields = [
            "display_name",
            "slug",
            "email",
            "profile_image",
            "short_bio",
            "location",
            "base_price",
            "years_of_experience",
            "portrait_styles",
            "min_delivery_days",
            "max_delivery_days",
            "average_rating",
            "total_reviews",
            "total_completed_orders",
            "is_available_for_commission",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "slug",
            "email",
            "average_rating",
            "total_reviews",
            "total_completed_orders",
            "created_at",
            "updated_at",
        ]

class ArtistProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistProfile
        fields = [
            "display_name",
            "profile_image",
            "short_bio",
            "location",
            "base_price",
            "years_of_experience",
            "portrait_styles",
            "min_delivery_days",
            "max_delivery_days",
            "is_available_for_commission",
        ]

    def validate(self, attrs):
        min_delivery_days = attrs.get(
            "min_delivery_days",
            self.instance.min_delivery_days
        )

        max_delivery_days = attrs.get(
            "max_delivery_days",
            self.instance.max_delivery_days
        )

        if min_delivery_days > max_delivery_days:
            raise serializers.ValidationError(
                "min_delivery_days cannot be greater than max_delivery_days."
            )

        return attrs
    

class ClientProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = ClientProfile
        fields = [
            "full_name",
            "email",
            "profile_image",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "email",
            "created_at",
            "updated_at",
        ]