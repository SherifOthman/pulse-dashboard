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

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Capture the current promise reference immediately.
    // Multiple concurrent 401s share the same promise — only one refresh
    // call is made. The finally{} sets refreshPromise=null but each caller
    // already holds its own reference to the in-flight promise.
    if (!refreshPromise) {
      refreshPromise = axios
        .post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        .then(({ data }) => {
          useAuthStore.getState().setSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        })
        .catch((e) => {
          useAuthStore.getState().clearSession();
          throw e;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    // Each concurrent request captures the same promise reference here,
    // so even if finally{} has already nulled the module-level variable,
    // this local reference is still valid.
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
