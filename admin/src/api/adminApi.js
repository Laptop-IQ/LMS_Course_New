import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

// Attach access token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminAccessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("adminRefreshToken");
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE}/api/admin/auth/refresh-token`,
          { refreshToken }
        );
        localStorage.setItem("adminAccessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(original);
      } catch {
        localStorage.clear();
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
