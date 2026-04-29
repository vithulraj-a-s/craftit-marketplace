import axiosInstance from './axiosInstance';

const BASE_URL = '/auth';

export const registerUser = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/register/`, data);
  return response.data;
};

export const verifyOTP = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/verify-otp/`, data);
  return response.data;
};

export const resendOTP = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/resend-otp/`, data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/login/`, data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post(`${BASE_URL}/logout/`);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/me/`);
  return response.data;
};

export const forgotPassword = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/forgot-password/`, data);
  return response.data;
};

export const verifyResetOTP = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/verify-reset-otp/`, data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await axiosInstance.post(`${BASE_URL}/reset-password/`, data);
  return response.data;
};
