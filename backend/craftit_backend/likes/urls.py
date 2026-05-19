from django.urls import path

from likes.views import (
    LikePortfolioItemAPIView,
    UnlikePortfolioItemAPIView,
)

urlpatterns = [
    path("<int:portfolio_item_id>/like/",LikePortfolioItemAPIView.as_view(),name="like-portfolio-item"),
    path("<int:portfolio_item_id>/unlike/",UnlikePortfolioItemAPIView.as_view(),name="unlike-portfolio-item"),
]