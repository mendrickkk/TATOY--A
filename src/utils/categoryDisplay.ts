/** Map keys: full IRI (lowercase), numeric id, slug — values: display name. */
export type CategoryLabelMap = Record<string, string>;

const CATEGORY_PATH_RE = /\/categories\/([^/?#]+)/i;

export function isCategoryIri(value: string): boolean {
  const t = value.trim();
  return (
    CATEGORY_PATH_RE.test(t) ||
    (t.startsWith('/') && t.includes('categories')) ||
    /^https?:\/\//i.test(t)
  );
}

export function categoryMatchKey(ref: string): string {
  return ref.trim().toLowerCase();
}

/** Normalize `/api/categories/22` from IRIs or full URLs. */
export function categoryPathKey(ref: string): string | null {
  const t = ref.trim();
  if (!t) {
    return null;
  }
  const fromPath = t.match(CATEGORY_PATH_RE);
  if (fromPath?.[1]) {
    return `/api/categories/${fromPath[1].toLowerCase()}`;
  }
  if (/^https?:\/\//i.test(t)) {
    const fromUrl = t.match(CATEGORY_PATH_RE);
    if (fromUrl?.[1]) {
      return `/api/categories/${fromUrl[1].toLowerCase()}`;
    }
  }
  return null;
}

function titleCaseWords(text: string): string {
  return text
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Fallback when the categories API is unavailable. */
export function fallbackCategoryLabel(ref: string): string {
  const trimmed = ref.trim();
  if (!trimmed) {
    return 'Category';
  }
  if (!isCategoryIri(trimmed)) {
    return titleCaseWords(trimmed);
  }
  const slug = trimmed.split('/').filter(Boolean).pop() ?? '';
  if (/^\d+$/.test(slug)) {
    return `Collection ${slug}`;
  }
  return titleCaseWords(slug);
}

/** All lookup keys for a product category ref (IRI, slug, numeric id). */
export function categoryRefKeys(ref: string): string[] {
  const trimmed = ref.trim();
  if (!trimmed) {
    return [];
  }
  const keys = new Set<string>();
  keys.add(categoryMatchKey(trimmed));
  const path = categoryPathKey(trimmed);
  if (path) {
    keys.add(path);
    keys.add(categoryMatchKey(path));
  }
  const slug = trimmed.split('/').filter(Boolean).pop()?.toLowerCase() ?? '';
  if (slug) {
    keys.add(slug);
    if (/^\d+$/.test(slug)) {
      keys.add(`/api/categories/${slug}`);
    }
  }
  if (/^\d+$/.test(trimmed)) {
    keys.add(trimmed);
    keys.add(`/api/categories/${trimmed}`);
  }
  return Array.from(keys);
}

export function resolveCategoryLabel(ref: string, labelMap: CategoryLabelMap): string {
  for (const key of categoryRefKeys(ref)) {
    const hit = labelMap[key];
    if (hit?.trim()) {
      return hit.trim();
    }
  }
  return fallbackCategoryLabel(ref);
}

/** Best display label for a product row (name, IRI + map, or fallback). */
export function getProductCategoryLabel(
  product: {category?: string | null},
  labelMap: CategoryLabelMap = {},
): string {
  const raw = product.category?.trim();
  if (!raw) {
    return '';
  }
  if (!isCategoryIri(raw)) {
    return raw;
  }
  return resolveCategoryLabel(raw, labelMap);
}

/** Canonical Home chip ids (Shop by occasion row). */
export const HOME_CHIP_IDS = [
  'wedding',
  'birthday',
  'anniversary',
  'fresh-picks',
  'popular',
  'thank-you',
] as const;

export type HomeChipId = (typeof HOME_CHIP_IDS)[number];

export function chipIdFromLabel(label: string): HomeChipId | null {
  const t = label.trim().toLowerCase().replace(/_/g, '-');
  if (!t) {
    return null;
  }
  for (const id of HOME_CHIP_IDS) {
    if (t === id || t.replace(/-/g, ' ') === id.replace(/-/g, ' ')) {
      return id;
    }
  }
  if (t.includes('wedding') || /\bbridal\b/.test(t)) {
    return 'wedding';
  }
  if (/\bbirthday\b/.test(t)) {
    return 'birthday';
  }
  if (/\banniversary\b/.test(t)) {
    return 'anniversary';
  }
  if (t.includes('fresh pick') || t.replace(/\s/g, '') === 'freshpicks') {
    return 'fresh-picks';
  }
  if (/\bpopular\b/.test(t) && /\bbouquet/.test(t)) {
    return 'popular';
  }
  if (/\bthank[\s-]?you\b|\bgratitude\b/.test(t)) {
    return 'thank-you';
  }
  return null;
}

export function labelsEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Merge category names discovered on product rows (embedded category objects). */
export function mergeCategoryLabelsFromProductRaw(
  map: CategoryLabelMap,
  raw: unknown,
): void {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return;
  }
  const o = raw as Record<string, unknown>;
  const c = o.category ?? o.Category ?? o.productCategory ?? o.ProductCategory;
  if (!c) {
    return;
  }
  if (typeof c === 'number' && Number.isFinite(c)) {
    return;
  }
  if (typeof c === 'string') {
    const s = c.trim();
    if (s && !isCategoryIri(s)) {
      registerCategoryLabel(map, s, s);
    }
    return;
  }
  if (typeof c === 'object' && !Array.isArray(c)) {
    const cat = c as Record<string, unknown>;
    const name =
      readStringish(cat.name) ||
      readStringish(cat.Name) ||
      readStringish(cat.title) ||
      readStringish(cat.label);
    const id =
      typeof cat.id === 'number'
        ? `/api/categories/${cat.id}`
        : readStringish(cat.id) || readStringish(cat['@id']);
    if (name) {
      registerCategoryLabel(map, id, name);
    }
  }
}

function readStringish(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return undefined;
}

export function mergeCategoryLabelsFromProducts(
  map: CategoryLabelMap,
  products: {category?: string | null}[],
): void {
  for (const p of products) {
    const raw = p.category?.trim();
    if (raw && !isCategoryIri(raw)) {
      registerCategoryLabel(map, raw, raw);
    }
  }
}

export function mergeCategoryLabelMaps(
  ...maps: CategoryLabelMap[]
): CategoryLabelMap {
  return Object.assign({}, ...maps);
}

export function registerCategoryLabel(
  map: CategoryLabelMap,
  id: string | undefined,
  name: string,
): void {
  const label = name.trim();
  if (!label) {
    return;
  }
  if (id?.trim()) {
    const raw = id.trim();
    for (const key of categoryRefKeys(raw)) {
      map[key] = label;
    }
  }
  map[categoryMatchKey(label)] = label;
  const chipId = chipIdFromLabel(label);
  if (chipId) {
    map[chipId] = label;
  }
  const lower = label.toLowerCase();
  if (/\bfresh\s*picks?\b/.test(lower) || lower.replace(/\s/g, '') === 'freshpicks') {
    map['fresh-picks'] = label;
    map['fresh picks'] = label;
  }
  if (/\bpopular\b/.test(lower) && /\bbouquet/.test(lower)) {
    map['popular'] = label;
    map['popular-bouquet'] = label;
    map['popular bouquet'] = label;
  }
}
