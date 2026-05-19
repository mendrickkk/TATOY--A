import type {CartLine} from '../types/cart';
import type {Product} from '../types/product';

/** Normalized non-negative stock when the API provided a value; `undefined` if unknown. */
export function getProductStock(product: Product): number | undefined {
  if (product.stock === undefined || product.stock === null) {
    return undefined;
  }
  const n = Math.floor(product.stock);
  return Number.isFinite(n) ? Math.max(0, n) : undefined;
}

export function isStockKnown(product: Product): boolean {
  return getProductStock(product) !== undefined;
}

export function isOutOfStock(product: Product): boolean {
  const stock = getProductStock(product);
  return stock !== undefined && stock === 0;
}

export function isInStock(product: Product): boolean {
  const stock = getProductStock(product);
  return stock !== undefined && stock > 0;
}

export function getMaxPurchasable(product: Product): number | undefined {
  const stock = getProductStock(product);
  if (stock === undefined) {
    return undefined;
  }
  return stock;
}

export function lowStockLabel(product: Product): string | null {
  const stock = getProductStock(product);
  if (stock === undefined || stock <= 0 || stock > 3) {
    return null;
  }
  return `Only ${stock} left`;
}

export function stockChipLabel(product: Product): string | null {
  const stock = getProductStock(product);
  if (stock === undefined || stock <= 0) {
    return null;
  }
  return `${stock} in stock`;
}

export function lineExceedsStock(line: CartLine): boolean {
  const max = getMaxPurchasable(line.product);
  if (max === undefined) {
    return false;
  }
  return line.quantity > max;
}

export type StockIssue = {
  productId: string;
  productName: string;
  requested: number;
  available: number;
};

export function getStockIssues(lines: CartLine[]): StockIssue[] {
  const issues: StockIssue[] = [];
  for (const line of lines) {
    const max = getMaxPurchasable(line.product);
    if (max !== undefined && line.quantity > max) {
      issues.push({
        productId: line.product.id,
        productName: line.product.name,
        requested: line.quantity,
        available: max,
      });
    }
  }
  return issues;
}

export function stockIssueMessage(issue: StockIssue): string {
  if (issue.available === 0) {
    return `${issue.productName} is out of stock.`;
  }
  return `${issue.productName}: only ${issue.available} available (you have ${issue.requested}).`;
}

export function cartLineStockHint(line: CartLine): string | null {
  const max = getMaxPurchasable(line.product);
  if (max === undefined) {
    return null;
  }
  return `Qty: ${line.quantity} / ${max} available`;
}

export function clampQuantityToStock(product: Product, quantity: number): number {
  const max = getMaxPurchasable(product);
  const q = Math.max(1, Math.floor(quantity));
  if (max === undefined) {
    return q;
  }
  return Math.min(q, max);
}
