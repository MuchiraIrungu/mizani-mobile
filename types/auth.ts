import type { ApiUser } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** The signed-in user, as returned by POST /users/login. */
export type User = ApiUser;

/** POST /api/v1/users/login */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** POST /api/v1/users/register — returns the created user only (no tokens). */
export interface RegisterRequest {
  fullName: string;
  phone: string;
  businessName: string;
  businessType: string;
  email: string;
  password: string;
}
