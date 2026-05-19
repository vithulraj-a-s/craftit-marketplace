from django.db import models

# Create your models here.
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator


class ArtistProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="artist_profile"
    )

    display_name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=120)
    profile_image = models.ImageField(
        upload_to="artist_profiles/",
        blank=True,
        null=True
    )

    short_bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )

    is_available_for_commission = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    years_of_experience = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])

    portrait_styles = models.JSONField(default=list, blank=True)

    min_delivery_days = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1)])
    max_delivery_days = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1)])

    average_rating = models.DecimalField(max_digits=3,decimal_places=2,default=0.00)

    total_reviews = models.PositiveIntegerField(default=0)
    total_completed_orders = models.PositiveIntegerField(default=0)
    total_likes = models.PositiveIntegerField(default=0)

    ranking_score = models.DecimalField(max_digits=10,decimal_places=4,default=0.0000,)
        
    def clean(self):
        super().clean()

        if self.user.role != "ARTIST":
            raise ValidationError(
                "Only users with ARTIST role can have an ArtistProfile."
            )

        if self.min_delivery_days > self.max_delivery_days:
            raise ValidationError(
                {
                    "min_delivery_days": (
                        "min_delivery_days cannot be greater than "
                        "max_delivery_days."
                    )
                }
            )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = f"{slugify(self.display_name)}-{self.user.id}"

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.display_name

class ClientProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_profile"
    )

    full_name = models.CharField(max_length=100)

    profile_image = models.ImageField(
        upload_to="client_profiles/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.user.role != "CLIENT":
            raise ValidationError("Only users with CLIENT role can have a ClientProfile.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name
    
