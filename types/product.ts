export interface ProductResponse {
  id: string;
  businessId: string;
  supplierId: string | null;
  name: string;
  sku: string;
  category: string | null;
  unitPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string | null;
}
export interface ProductRequest {
  supplierId?: string;
  name: string;
  sku: string;
  category?: string;
  unitPrice: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
}
