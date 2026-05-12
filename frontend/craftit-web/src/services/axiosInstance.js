import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/token/refresh/") &&
      !originalRequest.url.includes("/auth/login/")
    ) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post("/auth/token/refresh/");

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;
