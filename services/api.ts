import { useAuthStore } from "@/store/authStore";
import axios, { AxiosError } from "axios";
import Constants from "expo-constants";

// Where the Spring backend lives. Set EXPO_PUBLIC_API_URL in .env (see
// .env.example) — on a phone this must be your computer's LAN address,
// e.g. http://192.168.1.20:8080/api/v1, not localhost.
const fromConfig = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || fromConfig || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // An expired/invalid token ends the session; the root layout then
    // routes back to the login screen.
    const url = error.config?.url ?? "";
    if (error.response?.status === 401 && !url.includes("/users/login")) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

/** Human-readable message for any failed request. The backend's
    GlobalExceptionHandler puts the reason in `message`. */
export function apiError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const e = err as AxiosError<{ message?: string; error?: string }>;
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.response?.status === 401) return "Your session has expired. Please sign in again.";
  if (e?.response?.status === 403) return "You don't have permission to do that.";
  if (e?.code === "ECONNABORTED") return "The server took too long to respond.";
  if (e?.message === "Network Error") return `Can't reach the server at ${API_URL}.`;
  return fallback;
}
