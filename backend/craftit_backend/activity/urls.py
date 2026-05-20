from django.urls import path

from .views import (
    ClientNavbarSummaryAPIView, ArtistNavbarSummaryAPIView
)

urlpatterns = [
    path("client-navbar-summary/",ClientNavbarSummaryAPIView.as_view(),name="client-navbar-summary"),
    path("artist-navbar-summary/",ArtistNavbarSummaryAPIView.as_view(),name="artist-navbar-summary"),
]