import {
  getApiBaseCandidates,
  normalizeFetchConnectionError,
  REQUEST_TIMEOUT_MS,
} from './auth';
import {failIfAuthenticatedUnauthorized} from './session';
import {
  mergeCategoryLabelsFromProductRaw,
  type CategoryLabelMap,
} from '../../utils/categoryDisplay';
import {normalizeUnknownToProduct, type Product} from '../../types/product';

export type FetchProductsResult = {
  products: Product[];
  baseUrl: string;
  /** Names from embedded `category` objects on product rows (for IRI → label). */
  categoryLabels: CategoryLabelMap;
};

function stringish(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return value.join(', ');
  }
  return undefined;
}

function apiErrorMessageFromBody(data: unknown, defaultMessage: string): string {
  const body =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;
  const errors =
    body?.errors && typeof body.errors === 'object'
      ? (body.errors as Record<string, unknown>)
      : undefined;

  const hydra = body?.hydra;
  const hydraDescription =
    hydra && typeof hydra === 'object' && !Array.isArray(hydra)
      ? stringish((hydra as Record<string, unknown>).description)
      : undefined;

  return (
    hydraDescription ||
    stringish(body?.hydraDescription) ||
    stringish(body?.text) ||
    stringish(body?.message) ||
    stringish(body?.error) ||
    stringish(body?.detail) ||
    stringish(errors?.detail) ||
    stringish(errors?.message) ||
    defaultMessage
  );
}

/**
 * Reads a JWT string from persisted login payload (Symfony Lexik often returns `{ token }`).
 */
export function extractBearerJwtFromAuthData(data: unknown): string | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  const o = data as Record<string, unknown>;
  const keys = ['token', 'access_token', 'accessToken', 'jwt', 'JWT'];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) {
      return v.trim();
    }
  }
  return null;
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

function parseJsonResponse(rawText: string): unknown {
  if (!rawText) {
    return null;
  }
  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return {text: rawText};
  }
}

async function fetchProductsOnce(
  baseUrl: string,
  accept: string,
  signal: AbortSignal,
  authHeader: string | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {Accept: accept};
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  return fetch(`${baseUrl}/api/products`, {
    method: 'GET',
    headers,
    signal,
  });
}

export type FetchProductByIdResult = {
  product: Product;
  baseUrl: string;
};

/**
 * Builds `/api/products/{id}` (or preserves an existing `/api/products/...` suffix) for the given base URL.
 * Handles JSON-LD `@id` values that are absolute URLs or path-only IRIs.
 */
export function productItemApiPath(productId: string): string {
  const t = productId.trim();
  if (/^https?:\/\//i.test(t)) {
    const pathMatch = t.match(/^https?:\/\/[^/]+(\/api\/products\/[^/?#]+)/i);
    if (pathMatch?.[1]) {
      return pathMatch[1];
    }
  }
  const withoutQuery = (t.split('?')[0] ?? t).trim();
  const match = withoutQuery.match(/(\/api\/products\/[^/]+)\/?$/);
  if (match) {
    return match[1];
  }
  const slug = withoutQuery.replace(/^\/+/, '');
  return `/api/products/${slug}`;
}

async function fetchProductByIdOnce(
  baseUrl: string,
  path: string,
  accept: string,
  signal: AbortSignal,
  authHeader: string | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {Accept: accept};
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  const root = baseUrl.replace(/\/$/, '');
  return fetch(`${root}${path}`, {
    method: 'GET',
    headers,
    signal,
  });
}

/**
 * Builds a URL the `Image` component can load.
 * - Absolute `http(s)` → unchanged.
 * - `//host/...` → same scheme as `baseUrl`.
 * - Paths starting with `/uploads`, `/media`, `/images` → `baseUrl + path`.
 * - Strips leading `public/` (some Symfony/Vich paths store that).
 * - Bare filename (no `/`) → `baseUrl/uploads/<filename>` (common default; adjust if your public dir differs).
 * - Other relative paths → `baseUrl + / + path`.
 *
 * If the API only returns `/api/...` IRIs (JSON-LD) without a real file URL, this cannot show a photo — fix serialization on the server (expose `contentUrl` or a public path).
 */
export function getProductImageUri(
  baseUrl: string,
  image: string | null | undefined,
): string | null {
  if (!image || !image.trim()) {
    return null;
  }
  let trimmed = image.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    const isHttp = /^http:\/\//i.test(baseUrl);
    return `${isHttp ? 'http:' : 'https:'}${trimmed}`;
  }

  // JSON-LD API IRI without a file extension is almost never a direct image — avoid loading JSON as bitmap
  if (/\/api\//i.test(trimmed) && !/\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(trimmed)) {
    return null;
  }

  if (/^public\//i.test(trimmed)) {
    trimmed = trimmed.replace(/^public\/?/i, '');
  }

  const root = baseUrl.replace(/\/$/, '');

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (
    withLeadingSlash.startsWith('/uploads/') ||
    withLeadingSlash.startsWith('/media/') ||
    withLeadingSlash.startsWith('/images/') ||
    withLeadingSlash.startsWith('/files/')
  ) {
    return `${root}${withLeadingSlash}`;
  }

  // Bare filename, e.g. "bouquet.jpg"
  if (!trimmed.includes('/')) {
    return `${root}/uploads/${encodeURIComponent(trimmed)}`;
  }

  return `${root}${withLeadingSlash}`;
}

/**
 * Loads the product collection from API Platform. Tries each dev base URL like {@link userLogin}.
 *
 * @param getToken Optional getter for JWT — used on first request when available; on HTTP 401 without
 *                 an Authorization header, one retry adds `Bearer`.
 */
export async function fetchProducts(
  getToken?: () => string | null,
): Promise<FetchProductsResult> {
  let lastConnectionError: Error | null = null;

  for (const baseUrl of getApiBaseCandidates()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const run = async (
      accept: string,
    ): Promise<{response: Response; rawText: string; hadAuthAttempt: boolean}> => {
      const token = getToken?.() ?? null;
      const authHeader = token ? `Bearer ${token}` : undefined;
      const hadAuthAttempt = Boolean(authHeader);
      let response = await fetchProductsOnce(baseUrl, accept, controller.signal, authHeader);

      if (response.status === 401 && !authHeader) {
        const retryToken = getToken?.() ?? null;
        if (retryToken) {
          response = await fetchProductsOnce(
            baseUrl,
            accept,
            controller.signal,
            `Bearer ${retryToken}`,
          );
        }
      }

      if (response.status === 401 && authHeader) {
        response = await fetchProductsOnce(baseUrl, accept, controller.signal, undefined);
      }

      let rawText = '';
      try {
        rawText = await response.text();
      } catch {
        rawText = '';
      }
      return {response, rawText, hadAuthAttempt};
    };

    let response: Response;
    let rawText: string;
    let hadAuthAttempt = false;

    try {
      ({response, rawText, hadAuthAttempt} = await run('application/json'));
      if (response.status === 406) {
        ({response, rawText, hadAuthAttempt} = await run('application/ld+json'));
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        lastConnectionError = new Error(
          `Connection timed out reaching ${baseUrl}. Check that the server is running and reachable.`,
        );
      } else if (err instanceof Error) {
        lastConnectionError = normalizeFetchConnectionError(err);
      } else {
        lastConnectionError = new Error('Connection failed');
      }
      continue;
    }
    clearTimeout(timeoutId);

    const data = parseJsonResponse(rawText);

    if (response.ok) {
      const items = extractCollectionItems(data);
      const products: Product[] = [];
      const categoryLabels: CategoryLabelMap = {};
      for (const item of items) {
        mergeCategoryLabelsFromProductRaw(categoryLabels, item);
        const p = normalizeUnknownToProduct(item);
        if (p) {
          products.push(p);
        }
      }
      if (__DEV__ && items.length > 0 && typeof items[0] === 'object' && items[0] !== null) {
        const raw = items[0] as Record<string, unknown>;
        console.log('[fetchProducts] first item keys:', Object.keys(raw));
        console.log('[fetchProducts] category:', raw.category ?? raw.Category);
      }
      return {products, baseUrl, categoryLabels};
    }

    failIfAuthenticatedUnauthorized(
      response,
      data,
      hadAuthAttempt,
      'Could not load products',
    );

    const message = apiErrorMessageFromBody(data, 'Could not load products');
    const statusSuffix = response.status ? ` (HTTP ${response.status})` : '';
    throw new Error(`${message}${statusSuffix}`);
  }

  throw (
    lastConnectionError ||
    new Error('Connection failed. Check that the server is running and reachable.')
  );
}

/**
 * Loads a single product (API Platform item operation). Tries each dev base URL like {@link fetchProducts}.
 */
export async function fetchProductById(
  productId: string,
  getToken?: () => string | null,
): Promise<FetchProductByIdResult> {
  const path = productItemApiPath(productId);
  let lastConnectionError: Error | null = null;

  for (const baseUrl of getApiBaseCandidates()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const run = async (
      accept: string,
    ): Promise<{response: Response; rawText: string; hadAuthAttempt: boolean}> => {
      const token = getToken?.() ?? null;
      const authHeader = token ? `Bearer ${token}` : undefined;
      const hadAuthAttempt = Boolean(authHeader);
      let response = await fetchProductByIdOnce(
        baseUrl,
        path,
        accept,
        controller.signal,
        authHeader,
      );

      if (response.status === 401 && !authHeader) {
        const retryToken = getToken?.() ?? null;
        if (retryToken) {
          response = await fetchProductByIdOnce(
            baseUrl,
            path,
            accept,
            controller.signal,
            `Bearer ${retryToken}`,
          );
        }
      }

      if (response.status === 401 && authHeader) {
        response = await fetchProductByIdOnce(
          baseUrl,
          path,
          accept,
          controller.signal,
          undefined,
        );
      }

      let rawText = '';
      try {
        rawText = await response.text();
      } catch {
        rawText = '';
      }
      return {response, rawText, hadAuthAttempt};
    };

    let response: Response;
    let rawText: string;
    let hadAuthAttempt = false;

    try {
      ({response, rawText, hadAuthAttempt} = await run('application/json'));
      if (response.status === 406) {
        ({response, rawText, hadAuthAttempt} = await run('application/ld+json'));
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        lastConnectionError = new Error(
          `Connection timed out reaching ${baseUrl}. Check that the server is running and reachable.`,
        );
      } else if (err instanceof Error) {
        lastConnectionError = normalizeFetchConnectionError(err);
      } else {
        lastConnectionError = new Error('Connection failed');
      }
      continue;
    }
    clearTimeout(timeoutId);

    const data = parseJsonResponse(rawText);

    if (response.ok) {
      const product = normalizeUnknownToProduct(data);
      if (!product) {
        throw new Error('Could not parse product response');
      }
      return {product, baseUrl};
    }

    if (response.status === 404) {
      throw new Error('Product not found');
    }

    failIfAuthenticatedUnauthorized(
      response,
      data,
      hadAuthAttempt,
      'Could not load product',
    );

    const message = apiErrorMessageFromBody(data, 'Could not load product');
    const statusSuffix = response.status ? ` (HTTP ${response.status})` : '';
    throw new Error(`${message}${statusSuffix}`);
  }

  throw (
    lastConnectionError ||
    new Error('Connection failed. Check that the server is running and reachable.')
  );
}
