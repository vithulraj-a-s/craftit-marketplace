import axiosInstance from './axiosInstance';

export const createPortraitRequest = async (formData) => {
  const response = await axiosInstance.post('/api/portrait-requests/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getClientPortraitRequests = async () => {
  const response = await axiosInstance.get('/api/portrait-requests/client/');
  return response.data;
};

export const getArtistPortraitRequests = async () => {
  const response = await axiosInstance.get('/api/portrait-requests/artist/');
  return response.data;
};

export const getPortraitRequestDetail = async (id) => {
  const response = await axiosInstance.get(`/api/portrait-requests/${id}/`);
  return response.data;
};

export const updatePortraitRequestStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/api/portrait-requests/${id}/status/`, {
    status,
  });
  return response.data;
};
