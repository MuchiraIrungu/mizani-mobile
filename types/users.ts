export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessId: string;
  role: string;
}

export interface UserInfo {
  initials: string;
  name: string;
  firstName: string;
  businessId: string;
  role: string;
}
export interface BusinessResponse {
  id: string;
  name: string;
  kraPin: string | null;
  businessType: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  registrationNumber: string | null;
  currency: string | null;
  themeColor: string | null;
  status: string | null;
}
