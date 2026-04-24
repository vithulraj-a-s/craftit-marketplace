from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "amount",
            "status",
            "razorpay_order_id",
            "razorpay_payment_id",
            "created_at",
            "paid_at",
        ]
        read_only_fields = fields


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()

    def validate(self, attrs):
        missing = []

        for field in [
            "razorpay_order_id",
            "razorpay_payment_id",
            "razorpay_signature",
        ]:
            if not attrs.get(field):
                missing.append(field)

        if missing:
            raise serializers.ValidationError(
                f"Missing required fields: {', '.join(missing)}"
            )

        return attrs