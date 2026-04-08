# saved_artists/urls.py
from django.urls import path
from .views import (
    SavedArtistListView,
    SaveArtistView,
    RemoveSavedArtistView,
)

urlpatterns = [
    path("", SavedArtistListView.as_view()),
    path("<slug:artist_slug>/", SaveArtistView.as_view()),
    path("<slug:artist_slug>/delete/", RemoveSavedArtistView.as_view()),
]