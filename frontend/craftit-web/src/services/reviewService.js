import axiosInstance from './axiosInstance';

export const createReview = async (reviewData) => {
  const response = await axiosInstance.post('/api/reviews/', reviewData);
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await axiosInstance.patch(`/api/reviews/${reviewId}/`, reviewData);
  return response.data;
};

export const getArtistReviews = async (artistId, url = null) => {
  const targetUrl = url || `/api/reviews/artists/${artistId}/?page=1`;
  const response = await axiosInstance.get(targetUrl);
  return response.data;
};

export const getOrderReview = async (orderId) => {
  const response = await axiosInstance.get(`/api/reviews/orders/${orderId}/`);
  return response.data;
};
