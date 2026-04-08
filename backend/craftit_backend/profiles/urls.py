from django.urls import path
from profiles import views

urlpatterns = [
    path("artists/", views.ArtistListView.as_view(), name="artist-list"),
    path("artists/me/", views.ArtistMeView.as_view(), name="artist-me"),
    path("artists/<slug:slug>/", views.ArtistDetailView.as_view(), name="artist-detail"),
    path("clients/me/", views.ClientMeView.as_view(), name="client-me"),
]