export type CreateOrderLineRequest = {
  product: string;
  quantity: number;
};

export type CreateOrderRequest = {
  lines: CreateOrderLineRequest[];
  deliveryAddress: string;
  notes?: string;
};

export type OrderLineProduct = {
  name: string;
  imageUrl?: string | null;
};

export type OrderLine = {
  product: OrderLineProduct;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  deliveryAddress: string;
  notes?: string;
  lines: OrderLine[];
};

export const ACTIVE_ORDER_STATUSES = new Set(['pending', 'processing']);
export const COMPLETED_ORDER_STATUSES = new Set([
  'completed',
  'delivered',
  'cancelled',
]);

export function normalizeOrderStatus(status: string): string {
  return status.trim().toLowerCase();
}

export function isActiveOrderStatus(status: string): boolean {
  const s = normalizeOrderStatus(status);
  return ACTIVE_ORDER_STATUSES.has(s);
}

export function isCompletedOrderStatus(status: string): boolean {
  const s = normalizeOrderStatus(status);
  return COMPLETED_ORDER_STATUSES.has(s);
}
