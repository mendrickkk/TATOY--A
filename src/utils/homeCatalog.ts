import type {Product} from '../types/product';
import {
  categoryMatchKey,
  categoryRefKeys,
  chipIdFromLabel,
  getProductCategoryLabel,
  isCategoryIri,
  labelsEqual,
  mergeCategoryLabelsFromProducts,
  resolveCategoryLabel,
  type CategoryLabelMap,
} from './categoryDisplay';
import {filterProductsByQuery} from './productSearch';

export type HomeChip = {
  id: string;
  label: string;
};

export type HomeMerchandisingSectionId = 'popular' | 'fresh-picks';

export const HOME_QUICK_ACTIONS = [
  {id: 'same-day', label: 'Same-day', caption: 'Metro delivery', emoji: '🚚'},
  {id: 'custom', label: 'Custom', caption: 'Your bouquet', emoji: '💐'},
  {id: 'gifts', label: 'Gifts', caption: 'Ready to gift', emoji: '🎁'},
  {id: 'orders', label: 'Orders', caption: 'Track status', emoji: '📋'},
] as const;

/** Occasion chips shown on Home (canonical filter ids). */
export const HOME_OCCASIONS: HomeChip[] = [
  {id: 'wedding', label: 'Wedding'},
  {id: 'birthday', label: 'Birthday'},
  {id: 'anniversary', label: 'Anniversary'},
  {id: 'fresh-picks', label: 'Fresh picks'},
  {id: 'popular', label: 'Popular bouquet'},
  {id: 'thank-you', label: 'Thank you'},
];

const CHIP_KEYWORDS: Record<string, string[]> = {
  wedding: ['wedding', 'bridal', 'bride', 'groom'],
  birthday: ['birthday'],
  anniversary: ['anniversary'],
  'fresh-picks': ['fresh pick', 'fresh picks'],
  popular: ['popular bouquet', 'popular'],
  'thank-you': ['thank you', 'thank-you', 'gratitude', 'appreciation'],
};

const MERCHANDISING_CHIP_IDS = new Set<HomeMerchandisingSectionId>(['fresh-picks', 'popular']);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function chipLabel(chipId: string): string {
  return HOME_OCCASIONS.find(c => c.id === chipId)?.label ?? chipId;
}

function productTextHaystack(product: Product): string {
  return [product.name, product.description, product.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesKeyword(haystack: string, keyword: string): boolean {
  const k = keyword.trim().toLowerCase();
  if (!k) {
    return false;
  }
  if (k.includes(' ')) {
    return haystack.includes(k);
  }
  if (haystack.includes(k)) {
    return true;
  }
  return new RegExp(`\\b${escapeRegExp(k)}\\b`, 'i').test(haystack);
}

function categoryLabelMatchesChip(
  label: string,
  chipId: string,
  labelMap: CategoryLabelMap,
): boolean {
  const resolved = label.trim();
  if (!resolved) {
    return false;
  }

  const targetLabel = chipLabel(chipId);
  if (labelsEqual(resolved, targetLabel)) {
    return true;
  }
  if (chipIdFromLabel(resolved) === chipId) {
    return true;
  }

  const lower = resolved.toLowerCase();
  if (lower.includes(chipId.replace(/-/g, ' ')) || lower.includes(chipId)) {
    return true;
  }

  if (isCategoryIri(resolved)) {
    const mapped = resolveCategoryLabel(resolved, labelMap);
    return categoryLabelMatchesChip(mapped, chipId, labelMap);
  }

  return false;
}

function productMatchesCategoryFields(
  product: Product,
  chipId: string,
  labelMap: CategoryLabelMap,
): boolean {
  const cat = product.category?.trim();
  if (!cat) {
    return false;
  }

  if (categoryMatchKey(cat) === chipId || chipIdFromLabel(cat) === chipId) {
    return true;
  }

  if (!isCategoryIri(cat) && categoryLabelMatchesChip(cat, chipId, labelMap)) {
    return true;
  }

  const resolved = resolveCategoryLabel(cat, labelMap);
  return categoryLabelMatchesChip(resolved, chipId, labelMap);
}

function productMatchesKeywordFallback(product: Product, chipId: string): boolean {
  const keywords = CHIP_KEYWORDS[chipId] ?? [chipId];
  const haystack = productTextHaystack(product);
  return keywords.some(k => matchesKeyword(haystack, k));
}

/**
 * True when product belongs to the selected chip (category/label first, then name keywords).
 */
export function productMatchesChipFilter(
  product: Product,
  chipId: string,
  labelMap: CategoryLabelMap = {},
): boolean {
  if (MERCHANDISING_CHIP_IDS.has(chipId as HomeMerchandisingSectionId)) {
    return productMatchesMerchandisingSection(
      product,
      chipId as HomeMerchandisingSectionId,
      labelMap,
    );
  }

  const map = {...labelMap};
  mergeCategoryLabelsFromProducts(map, [product]);

  if (productMatchesCategoryFields(product, chipId, map)) {
    return true;
  }

  return productMatchesKeywordFallback(product, chipId);
}

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
    const id = chipIdFromLabel(resolveCategoryLabel(raw, labelMap)) ?? categoryMatchKey(raw);
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

/** Browse chips: HOME_OCCASIONS labels, enriched from API category names when available. */
export function buildBrowseChips(labelMap: CategoryLabelMap): HomeChip[] {
  const enriched = new Map<string, string>();
  for (const value of Object.values(labelMap)) {
    const id = chipIdFromLabel(value);
    if (id) {
      enriched.set(id, value.trim());
    }
  }
  if (labelMap['fresh-picks']) {
    enriched.set('fresh-picks', labelMap['fresh-picks']);
  }
  if (labelMap['popular']) {
    enriched.set('popular', labelMap['popular']);
  }

  return HOME_OCCASIONS.map(chip => ({
    id: chip.id,
    label: enriched.get(chip.id) ?? chip.label,
  }));
}

export type HomeCatalogFilters = {
  searchQuery: string;
  chipId: string | null;
  categoryLabelMap: CategoryLabelMap;
};

export function filterHomeCatalog(
  products: Product[],
  filters: HomeCatalogFilters,
): Product[] {
  let list = filterProductsByQuery(products, filters.searchQuery);
  if (filters.chipId) {
    list = list.filter(p =>
      productMatchesChipFilter(p, filters.chipId!, filters.categoryLabelMap),
    );
  }
  return list;
}

function normalizeSectionText(text: string): string {
  return text.trim().toLowerCase().replace(/[_-]+/g, ' ');
}

function labelMatchesFreshPicks(label: string): boolean {
  const t = normalizeSectionText(label);
  if (!t) {
    return false;
  }
  if (t.includes('fresh pick')) {
    return true;
  }
  if (t.replace(/\s/g, '') === 'freshpicks') {
    return true;
  }
  return /\bfresh\s*picks?\b/.test(t);
}

function labelMatchesPopularBouquet(label: string): boolean {
  const t = normalizeSectionText(label);
  if (!t) {
    return false;
  }
  return /\bpopular\b/.test(t) && /\bbouquet/.test(t);
}

function sectionLabelMatches(
  sectionId: HomeMerchandisingSectionId,
  label: string,
): boolean {
  return sectionId === 'fresh-picks'
    ? labelMatchesFreshPicks(label)
    : labelMatchesPopularBouquet(label);
}

function productMapsToSectionViaLabelMap(
  product: Product,
  sectionId: HomeMerchandisingSectionId,
  labelMap: CategoryLabelMap,
): boolean {
  const raw = product.category?.trim();
  if (!raw) {
    return false;
  }
  const productKeys = new Set(categoryRefKeys(raw));

  for (const key of productKeys) {
    const mapped = labelMap[key];
    if (mapped && sectionLabelMatches(sectionId, mapped)) {
      return true;
    }
  }

  for (const [mapKey, mapLabel] of Object.entries(labelMap)) {
    if (!sectionLabelMatches(sectionId, mapLabel)) {
      continue;
    }
    for (const key of categoryRefKeys(mapKey)) {
      if (productKeys.has(key)) {
        return true;
      }
    }
  }

  return false;
}

/** Admin categories used for Home rails (not occasion chips). */
export function productMatchesMerchandisingSection(
  product: Product,
  sectionId: HomeMerchandisingSectionId,
  labelMap: CategoryLabelMap = {},
): boolean {
  const displayLabel = getProductCategoryLabel(product, labelMap);
  if (displayLabel) {
    if (sectionId === 'fresh-picks' && labelMatchesFreshPicks(displayLabel)) {
      return true;
    }
    if (sectionId === 'popular' && labelMatchesPopularBouquet(displayLabel)) {
      return true;
    }
  }

  const raw = product.category?.trim();
  if (raw && !isCategoryIri(raw)) {
    if (sectionId === 'fresh-picks' && labelMatchesFreshPicks(raw)) {
      return true;
    }
    if (sectionId === 'popular' && labelMatchesPopularBouquet(raw)) {
      return true;
    }
  }

  return productMapsToSectionViaLabelMap(product, sectionId, labelMap);
}

export function pickPopularProducts(
  products: Product[],
  labelMap: CategoryLabelMap = {},
  limit = 12,
): Product[] {
  return products
    .filter(p => productMatchesMerchandisingSection(p, 'popular', labelMap))
    .slice(0, limit);
}

/** Stack header title for occasion-filtered catalog screens. */
export function occasionCatalogTitle(chipId: string, label?: string): string {
  const display =
    label?.trim() || HOME_OCCASIONS.find(c => c.id === chipId)?.label || chipId;
  if (chipId === 'fresh-picks') {
    return display;
  }
  if (chipId === 'popular') {
    return display;
  }
  return `${display} bouquets`;
}

export function merchandisingCatalogTitle(sectionId: HomeMerchandisingSectionId): string {
  return sectionId === 'fresh-picks' ? 'Fresh picks' : 'Popular bouquets';
}

export function pickFreshPicks(
  products: Product[],
  labelMap: CategoryLabelMap = {},
  limit = 10,
): Product[] {
  return products
    .filter(p => productMatchesMerchandisingSection(p, 'fresh-picks', labelMap))
    .slice(0, limit);
}
