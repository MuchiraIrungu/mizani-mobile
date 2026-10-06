import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export const api = axios.create({
  baseURL: "https://mizani.mooo.com/api/v1",
  //http://192.168.0.100:8000
  //U5sjtq$d9VwiAZ3H
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.accessToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
