from django.db import models
from django.utils import timezone
from orders.models import Order


class Payment(models.Model):
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment",
    )

    razorpay_order_id = models.CharField(max_length=255, unique=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True)
    razorpay_signature = models.CharField(max_length=500, blank=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    def mark_success(self, payment_id, signature):
        self.status = self.Status.SUCCESS
        self.razorpay_payment_id = payment_id
        self.razorpay_signature = signature
        self.paid_at = timezone.now()
        self.save()

        self.order.status = self.order.Status.IN_PROGRESS
        self.order.save()

    def __str__(self):
        return f"Payment #{self.id} - {self.order.id}"