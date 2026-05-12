from rest_framework import serializers
from orders.models import Order
from django.utils.timezone import now


class OrderListSerializer(serializers.ModelSerializer):

    client_email = serializers.CharField(
        source="client_profile.user.email"
    )

    artist_email = serializers.CharField(
        source="artist_profile.user.email"
    )

    amount = serializers.SerializerMethodField()

    class Meta:
        model = Order

        fields = [
            "id",
            "status",
            "client_email",
            "artist_email",
            "amount",
            "created_at",
            "completed_at",
        ]

    def get_amount(self, obj):

        if hasattr(obj, "payment"):
            return obj.payment.amount

        return None
    


class OrderUpdateSerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=Order.Status.choices
    )

    def update(self, instance, validated_data):

        allowed_transitions = {

            "pending_payment": [
                "in_progress",
                "cancelled"
            ],

            "in_progress": [
                "delivered",
                "cancelled"
            ],

            "delivered": [
                "completed"
            ],

            "completed": [],

            "cancelled": [],
        }

        current_status = instance.status

        new_status = validated_data.get("status")

        if (
            new_status not in
            allowed_transitions[current_status]
        ):
            raise serializers.ValidationError({
                "status":
                f"Cannot change status from "
                f"{current_status} to {new_status}"
            })

        if (
            new_status == "delivered" and
            not instance.final_image
        ):
            raise serializers.ValidationError({
                "final_image":
                "Final image is required before delivery"
            })

        instance.status = new_status

        if new_status == "completed":
            instance.completed_at = now()

        instance.save()

        return instance