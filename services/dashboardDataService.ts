import type {
  AddTransactionRequest,
  NotificationResponse,
  TransactionResponse,
} from "@/types/dashboard";
import { PayrollRunResponse } from "@/types/employee";
import { ProductRequest, ProductResponse } from "@/types/product";
import {
  CustomerRequest,
  CustomerResponse,
  InvoiceRequest,
  InvoiceResponse,
  SaleRequest,
  SaleResponse,
} from "@/types/sales";
import { SupplierRequest, SupplierResponse } from "@/types/supplier";
import type { UserResponseDto } from "@/types/users";
import { api } from "./api";

export async function getUserInfo(id: string): Promise<UserResponseDto> {
  const { data } = await api.get<UserResponseDto>(`/users/${id}`);
  return data;
}

export async function getTransactions(): Promise<TransactionResponse[]> {
  const { data } = await api.get<TransactionResponse[]>(`/transactions`);
  return data;
}

export async function createTransaction(
  payload: AddTransactionRequest,
): Promise<TransactionResponse> {
  const { data } = await api.post<TransactionResponse>(
    "/transactions",
    payload,
  );
  return data;
}

export async function getNotifications(unreadOnly = false) {
  const { data } = await api.get<NotificationResponse[]>("/notifications", {
    params: { unreadOnly },
  });
  return data;
}

export async function getInvoices(): Promise<InvoiceResponse[]> {
  const { data } = await api.get<InvoiceResponse[]>("/invoices");
  return data;
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch("/notifications/read-all");
}

export const getProducts = async () =>
  (await api.get<ProductResponse[]>("/products")).data;
export const createProduct = async (p: ProductRequest) =>
  (await api.post<ProductResponse>("/products", p)).data;
export const getSuppliers = async () =>
  (await api.get<SupplierResponse[]>("/suppliers")).data;
export const createSupplier = async (s: SupplierRequest) =>
  (await api.post<SupplierResponse>("/suppliers", s)).data;
export const getCustomers = async () =>
  (await api.get<CustomerResponse[]>("/customers")).data;
export const createSale = async (branchId: string, s: SaleRequest) =>
  (await api.post<SaleResponse>(`/sales/branch/${branchId}`, s)).data;
export const createInvoice = async (i: InvoiceRequest) =>
  (await api.post("/invoices", i)).data;
export const getPayrollRuns = async () =>
  (await api.get<PayrollRunResponse[]>("/payroll/runs")).data;
export const createPayrollRun = async (body: { payoutDate: string }) =>
  (await api.post<PayrollRunResponse>("/payroll/runs", body)).data;
export const createCustomer = async (c: CustomerRequest) =>
  (await api.post<CustomerResponse>("/customers", c)).data;
export const completeSale = async (saleId: string) =>
  (await api.post<SaleResponse>(`/sales/${saleId}/complete`)).data;
export const generatePayrollEntries = async (runId: string) =>
  (
    await api.post<PayrollRunResponse>(
      `/payroll/runs/${runId}/generate-entries`,
    )
  ).data;
