from django.urls import path
from .views import (
    CreateQuoteView,
    ArtistQuoteListView,
    ClientQuoteListView,
    QuoteDetailView,
    UpdateQuoteStatusView,
)

urlpatterns = [
    path("", CreateQuoteView.as_view()),
    path("artist/", ArtistQuoteListView.as_view()),
    path("client/", ClientQuoteListView.as_view()),
    path("<int:quote_id>/", QuoteDetailView.as_view()),
    path("<int:quote_id>/status/", UpdateQuoteStatusView.as_view()),
]