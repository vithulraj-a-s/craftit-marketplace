from django.shortcuts import render
import razorpay

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import Payment
from .serializers import VerifyPaymentSerializer


razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class CreatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        # Only clients should pay
        if request.user.role != "CLIENT":
            return Response(
                {"detail": "Only clients can create payments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Replace this in CreatePaymentView

        try:
            order = Order.objects.select_related(
                "client_profile",
                "quote",
            ).get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verify ownership
        if order.client_profile.user != request.user:
            return Response(
                {"detail": "You do not have permission to pay for this order."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Order must still be waiting for payment
        if order.status != Order.Status.PENDING_PAYMENT:
            return Response(
                {
                    "detail": (
                        "Payment can only be created for orders "
                        "with pending_payment status."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent creating multiple successful payments
        existing_payment = getattr(order, "payment", None)

        if existing_payment:
            if existing_payment.status == Payment.Status.SUCCESS:
                return Response(
                    {"detail": "This order has already been paid."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Reuse already created Razorpay order instead of making another one
            amount_in_paise = int(existing_payment.amount * 100)

            return Response(
                {
                    "payment_id": existing_payment.id,
                    "razorpay_order_id": existing_payment.razorpay_order_id,
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "key": settings.RAZORPAY_KEY_ID,
                    "status": existing_payment.status,
                },
                status=status.HTTP_200_OK,
            )

        amount = order.quote.amount
        amount_in_paise = int(amount * 100)

        try:
            razorpay_order = razorpay_client.order.create(
                {
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "payment_capture": 1,
                }
            )
        except Exception:
            return Response(
                {"detail": "Failed to create Razorpay order."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        payment = Payment.objects.create(
            order=order,
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
        )

        return Response(
            {
                "payment_id": payment.id,
                "razorpay_order_id": payment.razorpay_order_id,
                "amount": amount_in_paise,
                "currency": "INR",
                "key": settings.RAZORPAY_KEY_ID,
                "status": payment.status,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        razorpay_order_id = serializer.validated_data["razorpay_order_id"]
        razorpay_payment_id = serializer.validated_data["razorpay_payment_id"]
        razorpay_signature = serializer.validated_data["razorpay_signature"]

        # Replace this in VerifyPaymentView

        try:
            payment = Payment.objects.select_related(
                "order",
                "order__client_profile",
            ).get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the owner client can verify this payment
        if payment.order.client_profile.user != request.user:
            return Response(
                {"detail": "You do not have permission to verify this payment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Prevent duplicate verification
        if payment.status == Payment.Status.SUCCESS:
            return Response(
                {"detail": "Payment already verified successfully."},
                status=status.HTTP_200_OK,
            )

        try:
            razorpay_client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )
        except razorpay.errors.SignatureVerificationError:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])

            return Response(
                {"detail": "Invalid payment signature."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            payment.status = Payment.Status.SUCCESS
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.paid_at = timezone.now()

            payment.save(
                update_fields=[
                    "status",
                    "razorpay_payment_id",
                    "razorpay_signature",
                    "paid_at",
                ]
            )

            order = payment.order
            order.status = Order.Status.IN_PROGRESS
            order.save(update_fields=["status"])

        return Response(
            {
                "detail": "Payment verified successfully.",
                "payment_id": payment.id,
                "order_id": payment.order.id,
                "payment_status": payment.status,
                "order_status": payment.order.status,
            },
            status=status.HTTP_200_OK,
        )