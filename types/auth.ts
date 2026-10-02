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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessId: number | null;
  branchId: string;
  roleName: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
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
  data: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    businessId: number | null;
    roleName: string | null;
  };
  status: number;
}
