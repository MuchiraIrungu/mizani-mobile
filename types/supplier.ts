export interface SupplierResponse {
  id: string;
  businessId: string;
  name: string;
  phone: string | null;
  category: string | null;
  createdAt: string;
}
export interface SupplierRequest {
  name: string;
  phone?: string;
  category?: string;
}
