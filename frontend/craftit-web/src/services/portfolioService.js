import axiosInstance from './axiosInstance';

export const getArtistPortfolio = async (slug) => {
  const response = await axiosInstance.get(`/api/portfolio/artists/${slug}/`);
  return response.data;
};

export const createPortfolioItem = async (formData) => {
  const response = await axiosInstance.post('/api/portfolio/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updatePortfolioItem = async (id, formData) => {
  const response = await axiosInstance.patch(`/api/portfolio/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deletePortfolioItem = async (id) => {
  const response = await axiosInstance.delete(`/api/portfolio/${id}/delete/`);
  return response.data;
};

export const likePortfolioItem = async (id) => {
  const response = await axiosInstance.post(`/api/likes/${id}/like/`);
  return response.data;
};

export const unlikePortfolioItem = async (id) => {
  const response = await axiosInstance.delete(`/api/likes/${id}/unlike/`);
  return response.data;
};

export const getTrendingPortfolioItems = async () => {
  const response = await axiosInstance.get('/api/portfolio/trending/');
  return response.data;
};

