import axiosInstance from './axiosInstance';

export const getArtists = async (params = {}) => {
  const response = await axiosInstance.get('/api/artists/', { params });
  return response.data;
};

export const getArtistBySlug = async (slug) => {
  const response = await axiosInstance.get(`/api/artists/${slug}/`);
  return response.data;
};

export const getCurrentArtist = async () => {
  const response = await axiosInstance.get('/api/artists/me/');
  return response.data;
};

export const createArtistProfile = async (formData) => {
  const response = await axiosInstance.post('/api/artists/me/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateArtistProfile = async (formData) => {
  const response = await axiosInstance.patch('/api/artists/me/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
