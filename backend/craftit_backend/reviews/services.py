from decimal import Decimal

from django.db import transaction
from django.db.models import Avg, Count

from .models import ArtistReview
from orders.models import Order
from profiles.models import ArtistProfile
from rest_framework.exceptions import ValidationError

from django.shortcuts import get_object_or_404

from decimal import Decimal
import math


def calculate_ranking_score(artist):
    """
    Marketplace discovery ranking score.
    """

    average_rating_score = (float(artist.average_rating) * 0.5)

    reviews_score = (math.log(artist.total_reviews + 1) * 0.2)

    completed_orders_score = (math.log(artist.total_completed_orders + 1) * 0.2)

    likes_score = (math.log(artist.total_likes + 1) * 0.1)

    total_score = (average_rating_score + reviews_score + completed_orders_score + likes_score)

    return Decimal(str(round(total_score, 4)))


def update_artist_review_stats(artist: ArtistProfile) -> None:
    """
    Recalculate artist review aggregates and ranking score.
    """

    stats = ArtistReview.objects.filter(
        artist=artist
    ).aggregate(
        average_rating=Avg("rating"),
        total_reviews=Count("id"),
    )

    artist.average_rating = stats["average_rating"] or Decimal("0.00")
    artist.total_reviews = stats["total_reviews"] or 0

    artist.ranking_score = calculate_ranking_score(artist)

    artist.save(
        update_fields=[
            "average_rating",
            "total_reviews",
            "ranking_score",
        ]
    )


@transaction.atomic
def create_review(
    *,
    user,
    order_id: int,
    rating: int,
    review_text: str,
) -> ArtistReview:
    """
    Create artist review for a completed order.
    """

    order = Order.objects.select_related(
        "client_profile__user",
        "artist_profile__user",
    ).get(id=order_id)

    if order.client_profile.user != user:
        raise ValidationError("You cannot review this order.")

    if order.status != Order.Status.COMPLETED:
        raise ValidationError("Only completed orders can be reviewed.")

    if hasattr(order, "review"):
        raise ValidationError("Review already exists for this order.")

    artist = order.artist_profile

    if artist.user == user:
        raise ValidationError("Artists cannot review themselves.")

    review = ArtistReview.objects.create(
        order=order,
        reviewer=user,
        artist=artist,
        rating=rating,
        review=review_text,
    )

    update_artist_review_stats(artist)

    return review

@transaction.atomic
def update_review(
    *,
    user,
    review: ArtistReview,
    rating=None,
    review_text=None,
) -> ArtistReview:
    """
    Update an existing artist review.
    """

    if review.reviewer != user:
        raise ValidationError(
            "You cannot update this review."
        )

    if rating is not None:
        review.rating = rating

    if review_text is not None:
        review.review = review_text

    review.save(
        update_fields=[
            "rating",
            "review",
            "updated_at",
        ]
    )

    update_artist_review_stats(review.artist)

    return review

@transaction.atomic
def delete_review(
    *,
    user,
    review: ArtistReview,
) -> None:
    """
    Delete artist review and recalculate aggregates.
    """

    if review.reviewer != user:
        raise ValidationError(
            "You cannot delete this review."
        )

    artist = review.artist

    review.delete()

    update_artist_review_stats(artist)



def get_order_review(*, order_id: int):
    """
    Get review associated with a specific order.
    """

    return get_object_or_404(
        ArtistReview.objects.select_related(
            "reviewer",
            "artist",
            "order",
        ),
        order_id=order_id,
    )