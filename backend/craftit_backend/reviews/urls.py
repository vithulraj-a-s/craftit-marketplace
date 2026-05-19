from django.urls import path

from reviews.views import CreateArtistReviewAPIView,ArtistReviewListAPIView,UpdateArtistReviewAPIView,DeleteArtistReviewAPIView, OrderReviewDetailAPIView

urlpatterns = [
    path("",CreateArtistReviewAPIView.as_view(),name="create-artist-review"),
    path("artists/<int:artist_id>/",ArtistReviewListAPIView.as_view(),name="artist-review-list"),
    path("<int:review_id>/",UpdateArtistReviewAPIView.as_view(),name="update-artist-review"),
    path("<int:review_id>/delete/",DeleteArtistReviewAPIView.as_view(),name="delete-artist-review"),
    path("orders/<int:order_id>/",OrderReviewDetailAPIView.as_view(),name="order-review-detail"),
]