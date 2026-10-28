// Shapes returned and accepted by mizani-backend (dto/* records).
// Money comes back as JSON numbers (BigDecimal), ids as UUID strings,
// timestamps as ISO strings.

export type UUID = string;

/* ---------- Accounts ---------- */
export interface ApiUser {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  businessId: UUID | null;
  roleName: string | null;
  branchId: UUID | null;
}

export interface Business {
  id: UUID;
  name: string | null;
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
export type BusinessInput = Partial<Omit<Business, "id" | "status">>;

export interface Branch {
  id: UUID;
  businessId: UUID;
  name: string;
  location: string | null;
  isMain: boolean;
  createdAt: string;
}
export interface BranchInput {
  name: string;
  location?: string;
  isMain?: boolean;
}

/* ---------- Customers ---------- */
export interface Customer {
  id: UUID;
  name: string;
  phone: string | null;
  email: string | null;
  outstandingBalance: number | null;
  businessId: UUID;
}
export interface CustomerInput {
  name: string;
  phone?: string;
  email?: string;
}

/* ---------- Inventory ---------- */
export interface Product {
  id: UUID;
  businessId: UUID;
  supplierId: UUID | null;
  name: string;
  sku: string | null;
  category: string | null;
  unitPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}
export interface ProductInput {
  supplierId?: UUID | null;
  name: string;
  sku?: string;
  category?: string;
  unitPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
}

/* ---------- Sales & invoices ---------- */
export type SaleStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export interface SaleItem {
  id: UUID;
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
export interface Sale {
  id: UUID;
  businessId: UUID;
  branchId: UUID;
  customerId: UUID | null;
  recordedById: UUID | null;
  totalAmount: number;
  currency: string;
  paymentTransactionId: UUID | null;
  status: SaleStatus;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  lineItems: SaleItem[];
}
export interface SaleInput {
  branchId: UUID;
  customerId?: UUID | null;
  currency?: string;
  lineItems: { productId: UUID; quantity: number }[];
  occurredAt?: string;
}

export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "VOID";
export interface Invoice {
  id: UUID;
  businessId: UUID;
  saleId: UUID;
  customerId: UUID;
  customerName: string | null;
  invoiceNumber: string;
  dueDate: string | null;
  status: InvoiceStatus;
  etimsValidated: boolean;
  totalAmount: number;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface InvoiceInput {
  saleId: UUID;
  customerId: UUID;
  dueDate?: string;
}

/* ---------- Expenses ---------- */
export interface Expense {
  id: UUID;
  businessId: UUID;
  branchId: UUID;
  referenceNumber: string;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  recordedById: UUID | null;
  occurredAt: string;
  createdAt: string;
}
export interface ExpenseInput {
  branchId: UUID;
  category: string;
  description?: string;
  amount: number;
  currency?: string;
  occurredAt?: string;
}

/* ---------- Suppliers ---------- */
export interface Supplier {
  id: UUID;
  businessId: UUID;
  name: string;
  phone: string | null;
  category: string | null;
  createdAt: string;
}
export interface SupplierInput {
  name: string;
  phone?: string;
  category?: string;
}

export type SupplierPaymentStatus = "PENDING" | "PAID" | "FAILED";
export interface SupplierPayment {
  id: UUID;
  supplierId: UUID;
  businessId: UUID;
  supplierName: string | null;
  referenceNumber: string;
  amount: number;
  currency: string;
  status: SupplierPaymentStatus;
  paymentTransactionId: UUID | null;
  createdAt: string;
  updatedAt: string;
}
export interface SupplierPaymentInput {
  supplierId: UUID;
  referenceNumber?: string;
  amount: number;
  currency?: string;
}

/* ---------- Payroll ---------- */
export interface Employee {
  id: UUID;
  businessId: UUID;
  userId: UUID | null;
  name: string;
  roleTitle: string | null;
  phone: string | null;
  standardNetPay: number;
  createdAt: string;
}
export interface EmployeeInput {
  name: string;
  roleTitle?: string;
  phone?: string;
  standardNetPay: number;
}

export type PayrollRunStatus = "PENDING" | "COMPLETED";
export type PayrollEntryStatus = "PENDING" | "PAID";
export interface PayrollEntry {
  id: UUID;
  payrollRunId: UUID;
  employeeId: UUID;
  employeeName: string;
  grossPay: number;
  nssfDeduction: number;
  shaDeduction: number;
  payeDeduction: number;
  netPay: number;
  status: PayrollEntryStatus;
}
export interface PayrollRun {
  id: UUID;
  businessId: UUID;
  payoutDate: string;
  status: PayrollRunStatus;
  createdAt: string;
  entries: PayrollEntry[] | null;
}

/* ---------- Ledger ---------- */
export type EntryType = "SALE" | "EXPENSE" | "SUPPLIER_PAYMENT" | "PAYROLL";
export interface LedgerEntry {
  id: UUID;
  businessId: UUID;
  businessName: string;
  branchId: UUID;
  branchName: string;
  entryType: EntryType;
  sourceEntityId: UUID;
  referenceNumber: string;
  description: string | null;
  amount: number;
  direction: "INFLOW" | "OUTFLOW";
  paymentProviderDisplayName: string | null;
  kraStatus: "COMPLIANT" | "PENDING" | "NOT_APPLICABLE" | null;
  occurredAt: string;
}

/* ---------- Notifications ---------- */
export interface ApiNotification {
  id: UUID;
  businessId: UUID;
  userId: UUID | null;
  type: "TAX_DEADLINE" | "LOW_STOCK" | "PAYMENT_RECEIVED" | "SYSTEM";
  severity: "WARNING" | "SUCCESS" | "DANGER";
  message: string;
  readAt: string | null;
  createdAt: string;
}
