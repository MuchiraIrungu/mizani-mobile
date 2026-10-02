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
