from django.urls import path

from ai.views import SemanticArtistSearchView


urlpatterns = [
    path("semantic-search/",SemanticArtistSearchView.as_view(),name="semantic-search"),
]