from django.db import transaction
from django.db.models import F

from rest_framework.exceptions import ValidationError

from likes.models import PortfolioItemLike
from portfolio.models import PortfolioItem

from reviews.services import calculate_ranking_score


@transaction.atomic
def like_portfolio_item(*, user, portfolio_item_id: int):
    """
    Like a portfolio item.
    """

    portfolio_item = PortfolioItem.objects.select_related(
        "artist_profile",
    ).get(
        id=portfolio_item_id
    )

    already_liked = PortfolioItemLike.objects.filter(
        user=user,
        portfolio_item=portfolio_item,
    ).exists()

    if already_liked:
        raise ValidationError(
            "You already liked this portfolio item."
        )

    like = PortfolioItemLike.objects.create(
        user=user,
        portfolio_item=portfolio_item,
    )

    PortfolioItem.objects.filter(
        id=portfolio_item.id
    ).update(
        likes_count=F("likes_count") + 1
    )

    artist = portfolio_item.artist_profile

    artist.__class__.objects.filter(id=artist.id).update(total_likes=F("total_likes") + 1)

    artist.refresh_from_db()

    artist.ranking_score = calculate_ranking_score(
        artist
    )

    artist.save(update_fields=["ranking_score"])

    return like


@transaction.atomic
def unlike_portfolio_item(*, user, portfolio_item_id: int):
    """
    Unlike a portfolio item.
    """

    portfolio_item = PortfolioItem.objects.select_related(
        "artist_profile",
    ).get(
        id=portfolio_item_id
    )

    like = PortfolioItemLike.objects.filter(
        user=user,
        portfolio_item=portfolio_item,
    ).first()

    if not like:
        raise ValidationError(
            "Like does not exist."
        )

    like.delete()

    PortfolioItem.objects.filter(
        id=portfolio_item.id,
        likes_count__gt=0,
    ).update(
        likes_count=F("likes_count") - 1
    )

    artist = portfolio_item.artist_profile

    if artist.total_likes > 0:

        artist.__class__.objects.filter(
                id=artist.id,
                total_likes__gt=0,
            ).update(
                total_likes=F("total_likes") - 1
            )

    artist.refresh_from_db()

    artist.ranking_score = calculate_ranking_score(
        artist
    )

    artist.save(update_fields=["ranking_score"])