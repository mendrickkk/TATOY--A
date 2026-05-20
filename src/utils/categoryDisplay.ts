/** Map keys: full IRI (lowercase), numeric id, slug — values: display name. */
export type CategoryLabelMap = Record<string, string>;

const CATEGORY_PATH_RE = /\/categories\/([^/?#]+)/i;

export function isCategoryIri(value: string): boolean {
  const t = value.trim();
  return CATEGORY_PATH_RE.test(t) || (t.startsWith('/') && t.includes('categories'));
}

export function categoryMatchKey(ref: string): string {
  return ref.trim().toLowerCase();
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

export function resolveCategoryLabel(ref: string, labelMap: CategoryLabelMap): string {
  const key = categoryMatchKey(ref);
  const slug = ref.split('/').filter(Boolean).pop()?.toLowerCase() ?? '';

  return (
    labelMap[key] ||
    (slug ? labelMap[slug] : undefined) ||
    fallbackCategoryLabel(ref)
  );
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
    map[categoryMatchKey(raw)] = label;
    const slug = raw.split('/').filter(Boolean).pop();
    if (slug) {
      map[slug.toLowerCase()] = label;
    }
  }
  map[categoryMatchKey(label)] = label;
}
