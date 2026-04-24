import axiosInstance from './axiosInstance';

export const createPayment = async (orderId) => {
  const response = await axiosInstance.post(`/api/payments/create/${orderId}/`);
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post('/api/payments/verify/', paymentData);
  return response.data;
};
