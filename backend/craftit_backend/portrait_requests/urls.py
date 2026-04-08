# portrait_requests/urls.py

from django.urls import path

from .views import (
    CreatePortraitRequestView,
    ClientPortraitRequestListView,
    ArtistPortraitRequestListView,
    PortraitRequestDetailView,
    UpdatePortraitRequestStatusView,
)

urlpatterns = [
    path("",CreatePortraitRequestView.as_view(),name="create-portrait-request"),
    path("client/",ClientPortraitRequestListView.as_view(),name="client-portrait-requests"),
    path("artist/",ArtistPortraitRequestListView.as_view(),name="artist-portrait-requests"),
    path("<int:request_id>/",PortraitRequestDetailView.as_view(),name="portrait-request-detail"),
    path("<int:request_id>/status/",UpdatePortraitRequestStatusView.as_view(),name="update-portrait-request-status"),
]