from django.db import models
from profiles.models import ClientProfile, ArtistProfile

# Create your models here.


class SavedArtist(models.Model):
    client_profile = models.ForeignKey(
        ClientProfile,
        on_delete=models.CASCADE,
        related_name="saved_artists"
    )
    artist_profile = models.ForeignKey(
        ArtistProfile,
        on_delete=models.CASCADE,
        related_name="saved_by_clients"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["client_profile", "artist_profile"],
                name="unique_saved_artist_per_client"
            )
        ]

    def __str__(self):
        return f"{self.client_profile.full_name} saved {self.artist_profile.display_name}"