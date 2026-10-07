export interface PayrollEntryResponse {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  grossPay: number;
  nssfDeduction: number;
  shaDeduction: number;
  payeDeduction: number;
  netPay: number;
  status: "PENDING" | "PAID";
}
export interface PayrollRunResponse {
  id: string;
  businessId: string;
  payoutDate: string;
  status: string;
  createdAt: string;
  entries: PayrollEntryResponse[];
}
export interface EmployeeResponse {
  id: string;
  businessId: string;
  userId: string | null;
  name: string;
  roleTitle: string | null;
  phone: string | null;
  standardNetPay: number;
  createdAt: string;
}
export interface EmployeeRequest {
  name: string;
  roleTitle?: string;
  phone?: string;
  standardNetPay: number;
}
