from django.urls import path

from .views import (
    PortfolioCreateAPIView,
    ArtistPortfolioListAPIView,
    PortfolioUpdateAPIView,
    PortfolioDeleteAPIView,
)

urlpatterns = [
    path("", PortfolioCreateAPIView.as_view(), name="portfolio-create"),
    path("artists/<slug:slug>/",ArtistPortfolioListAPIView.as_view(),name="artist-portfolio-list"),
    path("<int:pk>/",PortfolioUpdateAPIView.as_view(),name="portfolio-update"),
    path("<int:pk>/delete/",PortfolioDeleteAPIView.as_view(),name="portfolio-delete"),
]