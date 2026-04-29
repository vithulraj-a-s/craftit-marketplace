// import axios from 'axios';

// const BASE_URL = 'http://127.0.0.1:8000';

// const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });


// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers['Authorization'] = 'Bearer ' + token;
//             return axiosInstance(originalRequest);
//           })
//           .catch((err) => {
//             return Promise.reject(err);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       const refresh = localStorage.getItem('refresh');
//       if (!refresh) {
//         localStorage.clear();
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       return new Promise(function (resolve, reject) {
//         axios
//           .post(`${BASE_URL}/auth/token/refresh/`, { refresh })
//           .then(({ data }) => {
//             localStorage.setItem('access', data.access);
//             axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + data.access;
//             originalRequest.headers['Authorization'] = 'Bearer ' + data.access;
//             processQueue(null, data.access);
//             resolve(axiosInstance(originalRequest));
//           })
//           .catch((err) => {
//             processQueue(err, null);
//             localStorage.clear();
//             window.location.href = '/login';
//             reject(err);
//           })
//           .finally(() => {
//             isRefreshing = false;
//           });
//       });
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // 🔥 FIXED
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔥 STOP infinite loop
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
