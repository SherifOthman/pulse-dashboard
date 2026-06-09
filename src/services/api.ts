import { useAuthStore } from "@/auth-store";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5170/dashboard",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const storedRefreshToken = useAuthStore.getState().refreshToken;
            const { data } = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
              { withCredentials: true },
            );
            useAuthStore.getState().setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          } catch (e) {
            useAuthStore.getState().clearSession();
            throw e;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      return refreshPromise.then(() => {
        originalRequest.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
        return api(originalRequest);
      });
    }

    return Promise.reject(error);
  },
);

export default api;
