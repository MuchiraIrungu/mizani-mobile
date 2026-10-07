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
export interface SupplierPaymentResponse {
  id: string;
  supplierId: string;
  businessId: string;
  supplierName: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED";
  paymentTransactionId: string | null;
  createdAt: string;
  updatedAt: string | null;
}
export interface SupplierPaymentRequest {
  supplierId: string;
  referenceNumber?: string;
  amount: number;
  currency: string;
}
