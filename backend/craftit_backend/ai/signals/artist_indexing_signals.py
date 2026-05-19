from django.db.models.signals import post_save
from django.dispatch import receiver

from profiles.models import ArtistProfile
from portfolio.models import PortfolioItem

from ai.services.indexing_service import SemanticIndexingService


@receiver(post_save, sender=ArtistProfile)
def reindex_artist_profile(sender, instance, **kwargs):

    SemanticIndexingService.index_artist(instance)


@receiver(post_save, sender=PortfolioItem)
def reindex_portfolio_item(sender, instance, **kwargs):

    SemanticIndexingService.index_artist(
        instance.artist_profile
    )