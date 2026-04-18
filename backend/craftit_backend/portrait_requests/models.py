from django.db import models
from profiles.models import ArtistProfile, ClientProfile
from django.core.exceptions import ValidationError
from datetime import date

# Create your models here.
class PortraitRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        QUOTE_SENT = "quote_sent", "Quote Sent"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"    


    client_profile = models.ForeignKey(
        ClientProfile,
        on_delete=models.CASCADE,
        related_name="portrait_requests"
    )

    artist_profile = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name="received_portrait_requests"
    )

    title = models.CharField(max_length=150)
    description = models.TextField()
    portrait_style = models.CharField(max_length=50)

    reference_image = models.ImageField(
        upload_to="portrait_requests/",
        blank=True,
        null=True,
    )

    budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )

    expected_delivery_date = models.DateField(
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def clean(self):

        if self.portrait_style:
            self.portrait_style = self.portrait_style.strip().lower()

        if (self.artist_profile and self.portrait_style and self.portrait_style not in self.artist_profile.portrait_styles):
            raise ValidationError({
                "portrait_style": "This artist does not support that portrait style."
            })

        if not self.artist_profile.is_available_for_commission:
            raise ValidationError({
                "artist_profile": "This artist is not accepting commissions."
            })

        if self.budget is not None and self.budget < 0:
            raise ValidationError({
                "budget": "Budget cannot be negative."
            })

        if self.expected_delivery_date and self.expected_delivery_date <= date.today():
            raise ValidationError({
                "expected_delivery_date": "Expected delivery date must be in the future."
            })

        if self.pk:
            previous = PortraitRequest.objects.get(pk=self.pk)

            allowed_transitions = {
                self.Status.PENDING: [
                    self.Status.QUOTE_SENT,
                    self.Status.REJECTED,
                    self.Status.CANCELLED,
                ],
                self.Status.QUOTE_SENT: [],
                self.Status.REJECTED: [],
                self.Status.CANCELLED: [],
            }

            if previous.status != self.status:
                if self.status not in allowed_transitions[previous.status]:
                    raise ValidationError({
                        "status": f"Cannot change status from {previous.status} to {self.status}."
                    })