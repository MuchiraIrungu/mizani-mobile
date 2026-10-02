export type EntryType = "SALE" | "EXPENSE";
export type Direction = "INFLOW" | "OUTFLOW";
export type KraStatus = "COMPLIANT" | "NON_COMPLIANT" | "PENDING";

export interface TransactionResponse {
  id: string;
  businessId: string;
  businessName: string;
  branchId: string;
  branchName: string;
  entryType: EntryType;
  sourceEntityId: string;
  referenceNumber: string;
  description: string;
  amount: number;
  direction: Direction;
  paymentProviderDisplayName: string;
  kraStatus: KraStatus;
  occurredAt: string;
}

export interface NotificationRequest {
  id: string;
  title: string;
  time: string;
  tone: string;
}

export interface NotificationResponse {
  id: string;
  businessId: string;
  userId: string | null;
  type: string;
  severity: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface AddTransactionRequest {
  entryType: string;
  paymentProviderDisplayName: string;
  amount: number;
  description?: string;
  occurredAt: string;
  branchId: string;
}

export interface AddTransactionResponse {
  data: {
    id: number;
    entryType: string;
    paymentProviderDisplayName: string;
    amount: number;
    description: string;
    occurredAt: Date;
  };
  status: number;
}
