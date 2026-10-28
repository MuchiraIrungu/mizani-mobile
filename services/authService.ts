import type { LoginRequest, LoginResponse, RegisterRequest, User } from "@/types/auth";
import { api } from "./api";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/users/login", payload);
  return data;
}

/** Creates the user, their business and a main branch. Sign in afterwards. */
export async function register(payload: RegisterRequest): Promise<User> {
  const { data } = await api.post<User>("/users/register", payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function updateMe(payload: { fullName?: string; phone?: string }): Promise<User> {
  const { data } = await api.put<User>("/users/me", payload);
  return data;
}

export async function listTeam(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}
