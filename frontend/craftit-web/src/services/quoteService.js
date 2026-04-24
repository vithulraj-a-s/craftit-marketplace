import axiosInstance from './axiosInstance';

export const updateQuoteStatus = async (id, status) => {
  const response = await axiosInstance.patch(
    `/api/quotes/${id}/status/`,
    { status }
  );

  return response.data;
};

export const getArtistQuotes = async () => {
  const response = await axiosInstance.get('/api/quotes/artist/');
  return response.data;
};

export const createQuote = async (quoteData) => {
  const response = await axiosInstance.post('/api/quotes/', quoteData);
  return response.data;
};
