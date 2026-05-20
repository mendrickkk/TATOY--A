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
export const CANCELLABLE_ORDER_STATUSES = new Set(['pending', 'processing']);
export const NON_CANCELLABLE_ORDER_STATUSES = new Set([
  'shipped',
  'delivered',
  'completed',
]);
export const COMPLETED_ORDER_STATUSES = new Set([
  'completed',
  'delivered',
  'cancelled',
  'shipped',
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

export function isOrderCancellable(status: string): boolean {
  return CANCELLABLE_ORDER_STATUSES.has(normalizeOrderStatus(status));
}

export function isOrderNonCancellableFinal(status: string): boolean {
  const s = normalizeOrderStatus(status);
  if (s === 'cancelled') {
    return false;
  }
  return NON_CANCELLABLE_ORDER_STATUSES.has(s);
}

export function isOrderCancelled(status: string): boolean {
  return normalizeOrderStatus(status) === 'cancelled';
}
