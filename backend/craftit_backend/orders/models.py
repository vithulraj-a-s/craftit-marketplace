from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone

from quotes.models import Quote
from profiles.models import ClientProfile, ArtistProfile


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "Pending Payment"
        IN_PROGRESS = "in_progress", "In Progress"
        DELIVERED = "delivered", "Delivered"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    quote = models.OneToOneField(
        Quote,
        on_delete=models.CASCADE,
        related_name="order",
    )

    client_profile = models.ForeignKey(
        ClientProfile,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    artist_profile = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    final_image = models.ImageField(
        upload_to="orders/final_images/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING_PAYMENT,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def clean(self):
        if self.quote.status != Quote.Status.ACCEPTED:
            raise ValidationError({
                "quote": "Order can only be created from an accepted quote."
            })

        if self.client_profile != self.quote.portrait_request.client_profile:
            raise ValidationError({
                "client_profile": "Client profile does not match the quote."
            })

        if self.artist_profile != self.quote.artist_profile:
            raise ValidationError({
                "artist_profile": "Artist profile does not match the quote."
            })

        if self.status == self.Status.DELIVERED and not self.final_image:
            raise ValidationError({
                "final_image": "Final image is required before delivery."
            })

        if self.pk:
            previous = Order.objects.get(pk=self.pk)

            allowed_transitions = {
                self.Status.PENDING_PAYMENT: [
                    self.Status.IN_PROGRESS,
                    self.Status.CANCELLED,
                ],
                self.Status.IN_PROGRESS: [
                    self.Status.DELIVERED,
                    self.Status.CANCELLED,
                ],
                self.Status.DELIVERED: [
                    self.Status.COMPLETED,
                ],
                self.Status.COMPLETED: [],
                self.Status.CANCELLED: [],
            }

            if previous.status != self.status:
                if self.status not in allowed_transitions[previous.status]:
                    raise ValidationError({
                        "status": (
                            f"Cannot change order status from "
                            f"'{previous.status}' to '{self.status}'."
                        )
                    })

    def save(self, *args, **kwargs):
        self.full_clean()

        if self.status == self.Status.COMPLETED and self.completed_at is None:
            self.completed_at = timezone.now()

        super().save(*args, **kwargs)