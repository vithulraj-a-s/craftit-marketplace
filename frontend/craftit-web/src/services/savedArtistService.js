import axiosInstance from './axiosInstance';

export const getSavedArtists = async () => {
  const response = await axiosInstance.get('/api/saved-artists/');
  return response.data;
};

export const saveArtist = async (slug) => {
  const response = await axiosInstance.post(`/api/saved-artists/${slug}/`);
  return response.data;
};

export const removeSavedArtist = async (slug) => {
  const response = await axiosInstance.delete(`/api/saved-artists/${slug}/delete/`);
  return response.data;
};
