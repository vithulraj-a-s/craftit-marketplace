from django.conf import settings
from django.db import models

from portfolio.models import PortfolioItem


class PortfolioItemLike(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="portfolio_likes",
    )

    portfolio_item = models.ForeignKey(
        PortfolioItem,
        on_delete=models.CASCADE,
        related_name="likes",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "portfolio_item_likes"

        constraints = [
            models.UniqueConstraint(
                fields=["user", "portfolio_item"],
                name="unique_user_portfolio_like",
            )
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} liked {self.portfolio_item}"
    
