from django.urls import path
from orders.views import (
    ClientOrderListView,
    ArtistOrderListView,
    OrderDetailView,
    OrderStatusUpdateView,
    ArtistDashboardView
)

urlpatterns = [
    path("client/", ClientOrderListView.as_view()),
    path("artist/", ArtistOrderListView.as_view()),
    path("<int:pk>/", OrderDetailView.as_view()),
    path("<int:pk>/status/", OrderStatusUpdateView.as_view()),
    path("dashboard/artist/", ArtistDashboardView.as_view(), name="artist-dashboard"),
   
]