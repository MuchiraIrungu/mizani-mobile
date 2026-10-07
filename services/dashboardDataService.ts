import type {
  AddTransactionRequest,
  NotificationResponse,
  TransactionResponse,
} from "@/types/dashboard";
import {
  EmployeeRequest,
  EmployeeResponse,
  PayrollEntryResponse,
  PayrollRunResponse,
} from "@/types/employee";
import {
  ProductRequest,
  ProductResponse,
  StockAdjustmentRequest,
} from "@/types/product";
import {
  CustomerRequest,
  CustomerResponse,
  InvoiceRequest,
  InvoiceResponse,
  SaleRequest,
  SaleResponse,
} from "@/types/sales";
import {
  SupplierPaymentRequest,
  SupplierPaymentResponse,
  SupplierRequest,
  SupplierResponse,
} from "@/types/supplier";
import type { BusinessResponse, UserResponseDto } from "@/types/users";
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
  (await api.get<CustomerResponse[]>("/customer")).data;
export const createSale = async (branchId: string, s: SaleRequest) =>
  (await api.post<SaleResponse>(`/sales/branch/${branchId}`, s)).data;
export const createInvoice = async (i: InvoiceRequest) =>
  (await api.post("/invoices", i)).data;
export const getPayrollRuns = async () =>
  (await api.get<PayrollRunResponse[]>("/payroll/runs")).data;
export const createPayrollRun = async (body: { payoutDate: string }) =>
  (await api.post<PayrollRunResponse>("/payroll/runs", body)).data;
export const createCustomer = async (c: CustomerRequest) =>
  (await api.post<CustomerResponse>("/customer", c)).data;
export const completeSale = async (saleId: string) =>
  (await api.post<SaleResponse>(`/sales/${saleId}/complete`)).data;
export const generatePayrollEntries = async (runId: string) =>
  (
    await api.post<PayrollRunResponse>(
      `/payroll/runs/${runId}/generate-entries`,
    )
  ).data;
export const getSupplierPayments = async (status?: "PENDING" | "PAID" | "FAILED") =>
  (
    await api.get<SupplierPaymentResponse[]>("/supplier-payments", {
      params: { status },
    })
  ).data;
export const getEmployees = async () =>
  (await api.get<EmployeeResponse[]>("/employees")).data;
// The backend resolves the business from the token; the path id is ignored.
export const getBusiness = async (userId: string) =>
  (await api.get<BusinessResponse>(`/businesses/${userId}`)).data;

// Products
export const getProduct = async (id: string) =>
  (await api.get<ProductResponse>(`/products/${id}`)).data;
export const updateProduct = async (id: string, p: Partial<ProductRequest>) =>
  (await api.put<ProductResponse>(`/products/${id}`, p)).data;
export const deleteProduct = async (id: string) => {
  await api.delete(`/products/${id}`);
};
export const adjustStock = async (id: string, body: StockAdjustmentRequest) =>
  (await api.patch<ProductResponse>(`/products/${id}/stock`, body)).data;

// Customers
export const getCustomer = async (id: string) =>
  (await api.get<CustomerResponse>(`/customer/${id}`)).data;
export const updateCustomer = async (id: string, c: CustomerRequest) =>
  (await api.put<CustomerResponse>(`/customer/${id}`, c)).data;
export const deleteCustomer = async (id: string) => {
  await api.delete(`/customer/${id}`);
};

// Suppliers
export const getSupplier = async (id: string) =>
  (await api.get<SupplierResponse>(`/suppliers/${id}`)).data;
export const updateSupplier = async (id: string, s: SupplierRequest) =>
  (await api.put<SupplierResponse>(`/suppliers/${id}`, s)).data;
export const deleteSupplier = async (id: string) => {
  await api.delete(`/suppliers/${id}`);
};
export const getPaymentsForSupplier = async (supplierId: string) =>
  (
    await api.get<SupplierPaymentResponse[]>("/supplier-payments", {
      params: { supplierId },
    })
  ).data;
export const createSupplierPayment = async (body: SupplierPaymentRequest) =>
  (await api.post<SupplierPaymentResponse>("/supplier-payments", body)).data;
export const completeSupplierPayment = async (id: string) =>
  (await api.post<SupplierPaymentResponse>(`/supplier-payments/${id}/complete`))
    .data;
export const cancelSupplierPayment = async (id: string) =>
  (await api.post<SupplierPaymentResponse>(`/supplier-payments/${id}/cancel`))
    .data;

// Invoices
export const getInvoice = async (id: string) =>
  (await api.get<InvoiceResponse>(`/invoices/${id}`)).data;
export const markInvoicePaid = async (id: string) =>
  (await api.post<InvoiceResponse>(`/invoices/${id}/pay`)).data;
export const markInvoiceOverdue = async (id: string) =>
  (await api.post<InvoiceResponse>(`/invoices/${id}/overdue`)).data;
export const voidInvoice = async (id: string) =>
  (await api.post<InvoiceResponse>(`/invoices/${id}/void`)).data;

// Employees
export const getEmployee = async (id: string) =>
  (await api.get<EmployeeResponse>(`/employees/${id}`)).data;
export const createEmployee = async (e: EmployeeRequest) =>
  (await api.post<EmployeeResponse>("/employees", e)).data;
export const updateEmployee = async (id: string, e: EmployeeRequest) =>
  (await api.put<EmployeeResponse>(`/employees/${id}`, e)).data;
export const deleteEmployee = async (id: string) => {
  await api.delete(`/employees/${id}`);
};

// Payroll
export const payPayrollEntry = async (entryId: string) =>
  (await api.post<PayrollEntryResponse>(`/payroll/runs/entries/${entryId}/pay`))
    .data;
export const completePayrollRun = async (runId: string) =>
  (await api.post<PayrollRunResponse>(`/payroll/runs/${runId}/complete`)).data;
