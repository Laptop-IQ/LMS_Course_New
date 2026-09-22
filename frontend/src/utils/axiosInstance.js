import axios from "axios";
import { TOKEN_KEY } from "@/constants/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

const axiosInstance = axios.create({
  baseURL: API_BASE, // ✅ correct usage
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
