import {
  getApiBaseCandidates,
  normalizeFetchConnectionError,
  REQUEST_TIMEOUT_MS,
} from './auth';
import {failIfAuthenticatedUnauthorized} from './session';
import {
  registerCategoryLabel,
  type CategoryLabelMap,
} from '../../utils/categoryDisplay';

function stringish(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return undefined;
}

function extractCollectionItems(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;
    const hydra = o['hydra:member'];
    if (Array.isArray(hydra)) {
      return hydra;
    }
    if (Array.isArray(o.member)) {
      return o.member;
    }
  }
  return [];
}

function parseCategoryEntry(raw: unknown): {id?: string; name?: string} | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const idVal = o.id ?? o.Id ?? o['@id'];
  const id =
    typeof idVal === 'number'
      ? `/api/categories/${idVal}`
      : typeof idVal === 'string' && idVal.trim()
        ? idVal.trim()
        : undefined;
  const name =
    stringish(o.name) ||
    stringish(o.Name) ||
    stringish(o.title) ||
    stringish(o.Title) ||
    stringish(o.label);
  if (!name) {
    return null;
  }
  return {id, name};
}

/**
 * Loads `/api/categories` and builds a lookup for product category IRIs → display names.
 */
export async function fetchCategoryLabelMap(
  getToken?: () => string | null,
): Promise<CategoryLabelMap> {
  const map: CategoryLabelMap = {};
  let lastConnectionError: Error | null = null;

  for (const baseUrl of getApiBaseCandidates()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const root = baseUrl.replace(/\/$/, '');
    const url = `${root}/api/categories`;

    try {
      const token = getToken?.() ?? null;
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {headers, signal: controller.signal});
      clearTimeout(timeoutId);

      let rawText = '';
      try {
        rawText = await response.text();
      } catch {
        rawText = '';
      }

      let data: unknown = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = null;
        }
      }

      if (response.ok) {
        for (const item of extractCollectionItems(data)) {
          const entry = parseCategoryEntry(item);
          if (entry?.name) {
            registerCategoryLabel(map, entry.id, entry.name);
          }
        }
        return map;
      }

      if (response.status === 404) {
        return map;
      }

      failIfAuthenticatedUnauthorized(
        response,
        data,
        Boolean(token),
        'Could not load categories',
      );
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        lastConnectionError = new Error(`Connection timed out reaching ${baseUrl}.`);
      } else if (err instanceof Error) {
        lastConnectionError = normalizeFetchConnectionError(err);
      }
      continue;
    }
  }

  if (lastConnectionError) {
    return map;
  }
  return map;
}
