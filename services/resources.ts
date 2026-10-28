// One typed client per backend controller (mizani-backend controller/*).
// Paths are relative to API_URL (…/api/v1). KRA is intentionally absent.
import type {
  ApiNotification,
  Branch,
  BranchInput,
  Business,
  BusinessInput,
  Customer,
  CustomerInput,
  Employee,
  EmployeeInput,
  Expense,
  ExpenseInput,
  Invoice,
  InvoiceInput,
  InvoiceStatus,
  LedgerEntry,
  PayrollEntry,
  PayrollRun,
  PayrollRunStatus,
  Product,
  ProductInput,
  Sale,
  SaleInput,
  SaleStatus,
  Supplier,
  SupplierInput,
  SupplierPayment,
  SupplierPaymentInput,
  SupplierPaymentStatus,
  UUID,
} from "@/types/api";
import { api } from "./api";

const get = async <T>(url: string, params?: object) => (await api.get<T>(url, { params })).data;
const post = async <T>(url: string, body?: unknown) => (await api.post<T>(url, body)).data;
const put = async <T>(url: string, body: unknown) => (await api.put<T>(url, body)).data;
const patch = async <T>(url: string, body?: unknown) => (await api.patch<T>(url, body)).data;
const del = async (url: string) => {
  await api.delete(url);
};

/** Drops undefined / empty-string query params so the backend sees "not set". */
const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));

export const businessApi = {
  /** The backend looks the business up by the owner's user id. */
  forUser: (userId: UUID) => get<Business>(`/businesses/${userId}`),
  update: (id: UUID, body: BusinessInput) => put<Business>(`/businesses/${id}`, body),
};

export const branchApi = {
  list: () => get<Branch[]>("/branches"),
  create: (body: BranchInput) => post<Branch>("/branches", body),
  update: (id: UUID, body: BranchInput) => put<Branch>(`/branches/${id}`, body),
  remove: (id: UUID) => del(`/branches/${id}`),
};

export const customerApi = {
  list: () => get<Customer[]>("/customer"),
  create: (body: CustomerInput) => post<Customer>("/customer", body),
  update: (id: UUID, body: CustomerInput) => put<Customer>(`/customer/${id}`, body),
  remove: (id: UUID) => del(`/customer/${id}`),
};

export const productApi = {
  list: (params: { search?: string; category?: string } = {}) =>
    get<Product[]>("/products", clean(params)),
  create: (body: ProductInput) => post<Product>("/products", body),
  update: (id: UUID, body: ProductInput) => put<Product>(`/products/${id}`, body),
  adjustStock: (id: UUID, quantityChange: number, reason: string) =>
    patch<Product>(`/products/${id}/stock`, { quantityChange, reason }),
  remove: (id: UUID) => del(`/products/${id}`),
};

export const saleApi = {
  list: (status?: SaleStatus) => get<Sale[]>("/sales", clean({ status })),
  create: (body: SaleInput) => post<Sale>(`/sales/branch/${body.branchId}`, body),
  update: (id: UUID, body: SaleInput) => put<Sale>(`/sales/${id}`, body),
  complete: (id: UUID) => post<Sale>(`/sales/${id}/complete`),
  cancel: (id: UUID) => post<Sale>(`/sales/${id}/cancel`),
};

export const invoiceApi = {
  list: (params: { status?: InvoiceStatus; customerId?: UUID } = {}) =>
    get<Invoice[]>("/invoices", clean(params)),
  create: (body: InvoiceInput) => post<Invoice>("/invoices", body),
  markPaid: (id: UUID) => post<Invoice>(`/invoices/${id}/pay`),
  markOverdue: (id: UUID) => post<Invoice>(`/invoices/${id}/overdue`),
  void: (id: UUID) => post<Invoice>(`/invoices/${id}/void`),
};

export const expenseApi = {
  list: (params: { branchId?: UUID } = {}) => get<Expense[]>("/expenses", clean(params)),
  create: (body: ExpenseInput) => post<Expense>("/expenses", body),
  update: (id: UUID, body: ExpenseInput) => put<Expense>(`/expenses/${id}`, body),
  remove: (id: UUID) => del(`/expenses/${id}`),
};

export const supplierApi = {
  list: () => get<Supplier[]>("/suppliers"),
  create: (body: SupplierInput) => post<Supplier>("/suppliers", body),
  update: (id: UUID, body: SupplierInput) => put<Supplier>(`/suppliers/${id}`, body),
  remove: (id: UUID) => del(`/suppliers/${id}`),
};

export const supplierPaymentApi = {
  list: (params: { supplierId?: UUID; status?: SupplierPaymentStatus } = {}) =>
    get<SupplierPayment[]>("/supplier-payments", clean(params)),
  create: (body: SupplierPaymentInput) => post<SupplierPayment>("/supplier-payments", body),
  complete: (id: UUID) => post<SupplierPayment>(`/supplier-payments/${id}/complete`),
  fail: (id: UUID) => post<SupplierPayment>(`/supplier-payments/${id}/fail`),
  cancel: (id: UUID) => post<SupplierPayment>(`/supplier-payments/${id}/cancel`),
};

export const employeeApi = {
  list: (nameSearch?: string) => get<Employee[]>("/employees", clean({ nameSearch })),
  create: (body: EmployeeInput) => post<Employee>("/employees", body),
  update: (id: UUID, body: EmployeeInput) => put<Employee>(`/employees/${id}`, body),
  remove: (id: UUID) => del(`/employees/${id}`),
};

export const payrollApi = {
  listRuns: (status?: PayrollRunStatus) => get<PayrollRun[]>("/payroll/runs", clean({ status })),
  getRun: (id: UUID) => get<PayrollRun>(`/payroll/runs/${id}`),
  createRun: (payoutDate: string) => post<PayrollRun>("/payroll/runs", { payoutDate }),
  generateEntries: (runId: UUID) => post<PayrollRun>(`/payroll/runs/${runId}/generate-entries`),
  payEntry: (entryId: UUID) => post<PayrollEntry>(`/payroll/runs/entries/${entryId}/pay`),
  completeRun: (runId: UUID) => post<PayrollRun>(`/payroll/runs/${runId}/complete`),
};

export const ledgerApi = {
  list: () => get<LedgerEntry[]>("/transactions"),
};

export const notificationApi = {
  list: (unreadOnly = false) => get<ApiNotification[]>("/notifications", { unreadOnly }),
  markRead: (id: UUID) => patch<ApiNotification>(`/notifications/${id}/read`),
  markAllRead: () => patch<void>("/notifications/read-all"),
  remove: (id: UUID) => del(`/notifications/${id}`),
};
