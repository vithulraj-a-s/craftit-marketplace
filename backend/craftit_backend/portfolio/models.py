from django.db import models

from profiles.models import ArtistProfile
from django.core.exceptions import ValidationError

# Create your models here.

class PortfolioItem(models.Model):
    artist_profile = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name="portfolio_items"
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    portrait_style = models.CharField(max_length=50)
    image = models.ImageField(upload_to="portfolio_items/")
    is_featured = models.BooleanField(default=False)
    
    likes_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]

    def clean(self):
        if not self.title.strip():
            raise ValidationError({"title": "Title cannot be empty."})

        if self.portrait_style != self.portrait_style.lower():
            raise ValidationError({
                "portrait_style": "Portrait style must be lowercase."
            })

        if self.portrait_style not in self.artist_profile.portrait_styles:
            raise ValidationError({
                "portrait_style": "Artist does not support this portrait style."
            })

    def save(self, *args, **kwargs):
        self.full_clean()

        if self.is_featured:
            PortfolioItem.objects.filter(
                artist_profile=self.artist_profile,
                is_featured=True
            ).exclude(pk=self.pk).update(is_featured=False)

        super().save(*args, **kwargs) 

    def __str__(self):
        return f"{self.artist_profile.display_name} - {self.title}"