import type {Product} from '../types/product';

/**
 * Client-side product filter by name (primary), category, and description.
 * Empty or whitespace-only query returns the full list unchanged.
 */
export function filterProductsByQuery(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return products;
  }
  return products.filter(p => {
    if (p.name.toLowerCase().includes(q)) {
      return true;
    }
    if (p.category?.toLowerCase().includes(q)) {
      return true;
    }
    if (p.description?.toLowerCase().includes(q)) {
      return true;
    }
    return false;
  });
}
