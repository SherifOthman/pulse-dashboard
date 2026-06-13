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

    // Only attempt refresh on 401. If this request already retried, give up.
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      const storedRefreshToken = useAuthStore.getState().refreshToken;

      // No refresh token stored at all — session is invalid, clear immediately.
      if (!storedRefreshToken) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      refreshPromise = axios
        .post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true },
        )
        .then(({ data }) => {
          useAuthStore.getState().setSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        })
        .catch((e) => {
          // Only clear the session if the server explicitly rejected the
          // refresh token (401). A network error or 5xx should NOT log the
          // user out — they can try again.
          if (e?.response?.status === 401) {
            useAuthStore.getState().clearSession();
          }
          throw e;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const pending = refreshPromise;

    return pending.then(
      () => {
        originalRequest.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
        return api(originalRequest);
      },
      () => Promise.reject(error),
    );
  },
);

export default api;
