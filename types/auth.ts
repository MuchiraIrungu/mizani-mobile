export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "staff" | "accountant";
  branchId: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  fullName: string;
  phone: string;
  businessName: string;
  businessType: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}
