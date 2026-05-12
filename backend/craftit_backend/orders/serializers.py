from rest_framework import serializers
from orders.models import Order

class OrderListSerializer(serializers.ModelSerializer):
    request_title = serializers.CharField(
        source="quote.portrait_request.title",
        read_only=True,
    )
    quote_amount = serializers.DecimalField(
        source="quote.amount",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    other_user_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "request_title",
            "quote_amount",
            "status",
            "other_user_name",
            "created_at",
        ]

    def get_other_user_name(self, obj):
        user = self.context["request"].user

        if user.role == "CLIENT":
            return obj.artist_profile.display_name

        return obj.client_profile.full_name
    

# class OrderDetailSerializer(serializers.ModelSerializer):
#     request_title = serializers.CharField(
#         source="quote.portrait_request.title",
#         read_only=True,
#     )
#     request_description = serializers.CharField(
#         source="quote.portrait_request.description",
#         read_only=True,
#     )
#     portrait_style = serializers.CharField(
#         source="quote.portrait_request.portrait_style",
#         read_only=True,
#     )
#     quote_amount = serializers.DecimalField(
#         source="quote.amount",
#         max_digits=10,
#         decimal_places=2,
#         read_only=True,
#     )
#     delivery_days = serializers.IntegerField(
#         source="quote.delivery_days",
#         read_only=True,
#     )

#     class Meta:
#         model = Order
#         fields = [
#             "id",
#             "request_title",
#             "request_description",
#             "portrait_style",
#             "quote_amount",
#             "delivery_days",
#             "status",
#             "final_image",
#             "created_at",
#             "completed_at",
#         ]

class OrderDetailSerializer(serializers.ModelSerializer):
    request_title = serializers.CharField(
        source="quote.portrait_request.title",
        read_only=True,
    )
    request_description = serializers.CharField(
        source="quote.portrait_request.description",
        read_only=True,
    )
    portrait_style = serializers.CharField(
        source="quote.portrait_request.portrait_style",
        read_only=True,
    )
    quote_amount = serializers.DecimalField(
        source="quote.amount",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    delivery_days = serializers.IntegerField(
        source="quote.delivery_days",
        read_only=True,
    )

 
    client = serializers.SerializerMethodField()
    artist = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "request_title",
            "request_description",
            "portrait_style",
            "quote_amount",
            "delivery_days",
            "status",
            "final_image",
            "created_at",
            "completed_at",
            "client",
            "artist",
        ]

    def get_client(self, obj):
        client = obj.client_profile
        return {
            "full_name": client.full_name,
            "email": client.user.email,
        }

    def get_artist(self, obj):
        artist = obj.artist_profile
        return {
            "display_name": artist.display_name,
            "email": artist.user.email,
        }


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["status", "final_image"]

    def validate(self, attrs):
        user = self.context["request"].user
        order = self.instance

        new_status = attrs.get("status")
        final_image = attrs.get("final_image")

        if user.role == "ARTIST":
            if order.artist_profile.user != user:
                raise serializers.ValidationError(
                    "You do not have permission to update this order."
                )

            if order.status != Order.Status.IN_PROGRESS:
                raise serializers.ValidationError(
                    "Only in-progress orders can be delivered."
                )

            if new_status != Order.Status.DELIVERED:
                raise serializers.ValidationError(
                    "Artist can only change status to delivered."
                )

            if not final_image and not order.final_image:
                raise serializers.ValidationError(
                    {"final_image": "Final image is required."}
                )

        elif user.role == "CLIENT":
            if order.client_profile.user != user:
                raise serializers.ValidationError(
                    "You do not have permission to update this order."
                )

            if order.status != Order.Status.DELIVERED:
                raise serializers.ValidationError(
                    "Only delivered orders can be completed."
                )

            if new_status != Order.Status.COMPLETED:
                raise serializers.ValidationError(
                    "Client can only change status to completed."
                )

        else:
            raise serializers.ValidationError("Invalid user role.")

        return attrs
    


# serializer for dashboard
class ArtistDashboardSerializer(serializers.Serializer):
    overview = serializers.DictField()
    earnings_chart = serializers.ListField()
    orders_distribution = serializers.DictField()
    portrait_requests = serializers.DictField()
    recent_activity = serializers.ListField()