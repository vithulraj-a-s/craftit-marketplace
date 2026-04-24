import axiosInstance from './axiosInstance';

export const getClientOrders = async () => {
  const response = await axiosInstance.get('/api/orders/client/');
  return response.data;
};

export const getArtistOrders = async () => {
  const response = await axiosInstance.get('/api/orders/artist/');
  return response.data;
};

export const updateOrderStatus = async (id, statusData) => {
  // statusData could be FormData if sending final_image, or object
  const headers = statusData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await axiosInstance.patch(`/api/orders/${id}/status/`, statusData, { headers });
  return response.data;
};
