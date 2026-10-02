import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth";
import { api } from "./api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/users/login", payload);
  return data;
}

export async function register(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse["data"]>(
    "/users/register",
    payload,
  );
  return { data: response.data, status: response.status };
}
