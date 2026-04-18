from django.db import models
from portrait_requests.models import PortraitRequest
from profiles.models import ArtistProfile
from django.core.exceptions import ValidationError

# Create your models here.

class Quote(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    portrait_request = models.OneToOneField(
        PortraitRequest,
        on_delete=models.CASCADE,
        related_name="quote",
    )

    artist_profile = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name="quotes",
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_days = models.PositiveIntegerField()
    message = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):

        if self.amount <= 0:
            raise ValidationError({"amount": "Amount must be greater than 0."})

        if self.delivery_days <= 0:
            raise ValidationError({
                "delivery_days": "Delivery days must be greater than 0."
            })

        if self.pk is None:
            if self.portrait_request.status != PortraitRequest.Status.PENDING:
                raise ValidationError({
                    "portrait_request": (
                        "Quotes can only be created for pending portrait requests."
                    )
                })
        
        if self.artist_profile != self.portrait_request.artist_profile:
            raise ValidationError({
                "artist_profile": "Only the assigned artist can create a quote."
            })
        
    def save(self, *args, **kwargs):
        from orders.models import Order

        is_new = self.pk is None
        previous_status = None

        if not is_new:
            try:
                previous_status = Quote.objects.get(pk=self.pk).status
            except Quote.DoesNotExist:
                previous_status = None

        self.full_clean()

        super().save(*args, **kwargs)

        # When quote is first created, mark portrait request as quote_sent
        if is_new:
            self.portrait_request.status = PortraitRequest.Status.QUOTE_SENT
            self.portrait_request.save(update_fields=["status"])

        # Create order only when quote changes from pending -> accepted
        if (
            not is_new
            and previous_status == Quote.Status.PENDING
            and self.status == Quote.Status.ACCEPTED
        ):
            Order.objects.get_or_create(
                quote=self,
                defaults={
                    "client_profile": self.portrait_request.client_profile,
                    "artist_profile": self.artist_profile,
                },
            )