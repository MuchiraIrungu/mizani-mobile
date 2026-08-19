import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from "@/types/auth";
import { api } from "./api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function register(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await api.post<LoginResponse>("/auth/register", payload);
  return data;
}
