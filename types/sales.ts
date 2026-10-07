export interface InvoiceResponse {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  saleId: string;
  invoiceNumber: string;
  dueDate: string; // "YYYY-MM-DD"
  status: "PENDING" | "OVERDUE" | "PAID" | "VOID";
  etimsValidated: boolean;
  totalAmount: number;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}
export interface CustomerResponse {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  outstandingBalance: number | null;
  businessName: string | null;
}
export interface CustomerRequest {
  name: string;
  phone?: string;
  email?: string;
}

export interface SaleRequest {
  customerId?: string;
  currency: string;
  occurredAt?: string;
  lineItems: { productId: string; quantity: number }[];
}
export interface SaleResponse {
  id: string;
  totalAmount: number;
}
export interface InvoiceRequest {
  saleId: string;
  customerId: string;
  dueDate?: string;
}
