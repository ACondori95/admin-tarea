import axios from "axios";
import {BASE_URL} from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {"Content-Type": "application/json", Accept: "application/json"},
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors globally
    if (error.response) {
      if (error.response.status === 401) {
        // Redirect to login page
        window.location.href = "/ingresar";
      } else if (error.response.status === 500) {
        console.error(
          "Error del servidor. Por favor, intentá de nuevo más tarde."
        );
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Tiempo de espera agotado. Por favor, intentá de nuevo.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
