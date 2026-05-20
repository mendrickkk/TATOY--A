import type {Product} from '../types/product';
import {
  categoryMatchKey,
  resolveCategoryLabel,
  type CategoryLabelMap,
} from './categoryDisplay';
import {filterProductsByQuery} from './productSearch';

export type HomeChip = {
  id: string;
  label: string;
};

export const HOME_QUICK_ACTIONS = [
  {id: 'same-day', label: 'Same-day', caption: 'Metro delivery', emoji: '🚚'},
  {id: 'custom', label: 'Custom', caption: 'Your bouquet', emoji: '💐'},
  {id: 'gifts', label: 'Gifts', caption: 'Ready to gift', emoji: '🎁'},
  {id: 'orders', label: 'Orders', caption: 'Track status', emoji: '📋'},
] as const;

export const HOME_OCCASIONS: HomeChip[] = [
  {id: 'wedding', label: 'Wedding'},
  {id: 'birthday', label: 'Birthday'},
  {id: 'anniversary', label: 'Anniversary'},
  {id: 'sympathy', label: 'Sympathy'},
  {id: 'romance', label: 'Romance'},
  {id: 'thank-you', label: 'Thank you'},
];

const OCCASION_KEYWORDS: Record<string, string[]> = {
  wedding: ['wedding', 'bridal', 'bride'],
  birthday: ['birthday', 'celebration', 'party'],
  anniversary: ['anniversary', 'love'],
  sympathy: ['sympathy', 'condolence', 'funeral'],
  romance: ['rose', 'romance', 'valentine', 'love'],
  'thank-you': ['thank', 'gratitude', 'appreciation'],
};

export function extractCategoryChips(
  products: Product[],
  labelMap: CategoryLabelMap = {},
): HomeChip[] {
  const seen = new Map<string, HomeChip>();
  for (const p of products) {
    const raw = p.category?.trim();
    if (!raw) {
      continue;
    }
    const id = categoryMatchKey(raw);
    if (seen.has(id)) {
      continue;
    }
    seen.set(id, {
      id,
      label: resolveCategoryLabel(raw, labelMap),
    });
  }
  return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function productMatchesCategory(product: Product, categoryId: string): boolean {
  const cat = product.category?.trim();
  if (!cat) {
    return false;
  }
  return categoryMatchKey(cat) === categoryMatchKey(categoryId);
}

function productMatchesOccasion(product: Product, occasionId: string): boolean {
  const keywords = OCCASION_KEYWORDS[occasionId] ?? [occasionId];
  const haystack = [product.name, product.description, product.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return keywords.some(k => haystack.includes(k));
}

export type HomeCatalogFilters = {
  searchQuery: string;
  categoryId: string | null;
  occasionId: string | null;
};

export function filterHomeCatalog(
  products: Product[],
  filters: HomeCatalogFilters,
): Product[] {
  let list = filterProductsByQuery(products, filters.searchQuery);
  if (filters.categoryId) {
    list = list.filter(p => productMatchesCategory(p, filters.categoryId!));
  }
  if (filters.occasionId) {
    list = list.filter(p => productMatchesOccasion(p, filters.occasionId!));
  }
  return list;
}

export function pickPopularProducts(products: Product[], limit = 12): Product[] {
  return products.slice(0, limit);
}

export function pickFreshPicks(products: Product[], limit = 10): Product[] {
  if (products.length <= limit) {
    return products;
  }
  return [...products].reverse().slice(0, limit);
}
