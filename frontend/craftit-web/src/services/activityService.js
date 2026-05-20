import axiosInstance from './axiosInstance';

export const getClientNavbarSummary = async () => {
  const response = await axiosInstance.get('/api/activity/client-navbar-summary/');
  return response.data;
};

export const getArtistNavbarSummary = async () => {
  const response = await axiosInstance.get('/api/activity/artist-navbar-summary/');
  return response.data;
};
