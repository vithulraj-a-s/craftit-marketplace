import axiosInstance from './axiosInstance';

export const getCurrentClient = async () => {
  const response = await axiosInstance.get('/api/clients/me/');
  return response.data;
};

export const createClientProfile = async (formData) => {
  const response = await axiosInstance.post('/api/clients/me/', formData);
  return response.data;
};

export const updateClientProfile = async (formData) => {
  const response = await axiosInstance.patch('/api/clients/me/', formData);
  return response.data;
};
