import {
  getApiBaseCandidates,
  normalizeFetchConnectionError,
  REQUEST_TIMEOUT_MS,
} from './auth';
import {productItemApiPath} from './products';
import {failIfAuthenticatedUnauthorized} from './session';
import type {CreateOrderRequest, Order, OrderLine} from '../../types/order';

export type CreateOrderResult = {
  order: Order;
  baseUrl: string;
};

export type FetchMyOrdersResult = {
  orders: Order[];
  baseUrl: string;
};

function stringish(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return value.join(', ');
  }
  return undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(',', '.'));
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return undefined;
}

export class OrderApiError extends Error {
  readonly bullets: string[];

  constructor(message: string, bullets: string[] = []) {
    super(message);
    this.name = 'OrderApiError';
    this.bullets = bullets.length > 0 ? bullets : [message];
  }
}

function collectViolationMessages(value: unknown): string[] {
  if (!value) {
    return [];
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectViolationMessages);
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const direct =
      stringish(o.message) ||
      stringish(o.detail) ||
      stringish(o.title) ||
      stringish(o.description);
    if (direct) {
      return [direct];
    }
    return Object.values(o).flatMap(collectViolationMessages);
  }
  return [];
}

export function apiErrorBulletsFromBody(data: unknown, defaultMessage: string): string[] {
  const body =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;
  if (!body) {
    return [defaultMessage];
  }

  const violations = body.violations ?? body.Violations;
  const fromViolations = collectViolationMessages(violations);
  if (fromViolations.length > 0) {
    return fromViolations;
  }

  const errors =
    body.errors && typeof body.errors === 'object'
      ? (body.errors as Record<string, unknown>)
      : undefined;

  const hydra = body['hydra:description'] ?? body.hydraDescription;
  const hydraObj = body.hydra;
  const hydraDescription =
    stringish(hydra) ||
    (hydraObj && typeof hydraObj === 'object' && !Array.isArray(hydraObj)
      ? stringish((hydraObj as Record<string, unknown>).description)
      : undefined);

  const single =
    hydraDescription ||
    stringish(body.message) ||
    stringish(body.error) ||
    stringish(body.detail) ||
    stringish(body.title) ||
    stringish(body.description) ||
    stringish(errors?.detail) ||
    stringish(errors?.message) ||
    stringish(errors?.title);

  if (single) {
    return [single];
  }

  const nestedErrors = collectViolationMessages(errors);
  if (nestedErrors.length > 0) {
    return nestedErrors;
  }

  return [defaultMessage];
}

function apiErrorMessageFromBody(data: unknown, defaultMessage: string): string {
  return apiErrorBulletsFromBody(data, defaultMessage)[0] ?? defaultMessage;
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

function normalizeOrderLine(raw: unknown): OrderLine | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const quantity = readNumber(o.quantity ?? o.Quantity) ?? 0;
  const unitPrice = readNumber(o.unitPrice ?? o.UnitPrice ?? o.price) ?? 0;
  const subtotal =
    readNumber(o.subtotal ?? o.Subtotal) ?? unitPrice * Math.max(quantity, 0);

  const productRaw = o.product ?? o.Product;
  let name = 'Item';
  let imageUrl: string | null | undefined;
  if (productRaw && typeof productRaw === 'object' && !Array.isArray(productRaw)) {
    const p = productRaw as Record<string, unknown>;
    name =
      stringish(p.name) ||
      stringish(p.Name) ||
      stringish(p.title) ||
      name;
    imageUrl =
      stringish(p.imageUrl) ||
      stringish(p.ImageUrl) ||
      stringish(p.image) ||
      stringish(p.contentUrl) ||
      null;
  } else if (typeof productRaw === 'string') {
    name = productRaw;
  }

  if (quantity <= 0) {
    return null;
  }

  return {
    product: {name, imageUrl},
    quantity,
    unitPrice,
    subtotal,
  };
}

export function normalizeUnknownToOrder(raw: unknown): Order | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const idVal = o.id ?? o.Id;
  const id =
    typeof idVal === 'number'
      ? String(idVal)
      : typeof idVal === 'string' && idVal.trim()
        ? idVal.trim()
        : stringish(o['@id']);
  const orderNumber =
    stringish(o.orderNumber) ||
    stringish(o.OrderNumber) ||
    stringish(o.reference) ||
    id;
  const status = stringish(o.status) || stringish(o.Status) || 'pending';
  const total = readNumber(o.total ?? o.Total) ?? 0;
  const createdAt =
    stringish(o.createdAt) ||
    stringish(o.CreatedAt) ||
    stringish(o.created_at) ||
    '';
  const deliveryAddress =
    stringish(o.deliveryAddress) ||
    stringish(o.DeliveryAddress) ||
    stringish(o.address) ||
    '';
  const notes = stringish(o.notes) || stringish(o.Notes);

  const linesRaw = o.lines ?? o.Lines ?? o.orderLines ?? o.items;
  const lines: OrderLine[] = [];
  if (Array.isArray(linesRaw)) {
    for (const entry of linesRaw) {
      const line = normalizeOrderLine(entry);
      if (line) {
        lines.push(line);
      }
    }
  }

  if (!id || !orderNumber) {
    return null;
  }

  return {
    id,
    orderNumber,
    status,
    total,
    createdAt,
    deliveryAddress,
    notes: notes || undefined,
    lines,
  };
}

async function fetchWithAuth(
  baseUrl: string,
  path: string,
  init: RequestInit,
  signal: AbortSignal,
  authHeader: string | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {
  ...(init.headers as Record<string, string>),
  };
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  const root = baseUrl.replace(/\/$/, '');
  return fetch(`${root}${path}`, {...init, headers, signal});
}

type RequestJsonOptions = {
  /** Request body MIME (e.g. API Platform PATCH → merge-patch+json). */
  contentType?: string;
  /** Response Accept header; defaults to application/ld+json. */
  accept?: string;
};

async function requestJson(
  path: string,
  init: RequestInit,
  getToken: () => string | null,
  defaultError: string,
  expectStatus: number,
  options?: RequestJsonOptions,
): Promise<{data: unknown; baseUrl: string}> {
  let lastConnectionError: Error | null = null;
  const acceptMime = options?.accept?.trim() || 'application/ld+json';
  const bodyMime = options?.contentType?.trim();

  for (const baseUrl of getApiBaseCandidates()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const run = async (
      accept: string,
      contentType?: string,
    ): Promise<{response: Response; rawText: string; hadAuthAttempt: boolean}> => {
      const token = getToken() ?? null;
      const authHeader = token ? `Bearer ${token}` : undefined;
      const hadAuthAttempt = Boolean(authHeader);
      const headers: Record<string, string> = {
        Accept: accept,
        ...(init.headers as Record<string, string>),
      };
      if (init.body) {
        headers['Content-Type'] = contentType ?? accept;
      }
      let response = await fetchWithAuth(
        baseUrl,
        path,
        {...init, headers},
        controller.signal,
        authHeader,
      );
      if (response.status === 401 && !authHeader) {
        const retryToken = getToken();
        if (retryToken) {
          response = await fetchWithAuth(
            baseUrl,
            path,
            {...init, headers},
            controller.signal,
            `Bearer ${retryToken}`,
          );
        }
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
      ({response, rawText, hadAuthAttempt} = await run(acceptMime, bodyMime));
      if (!bodyMime && (response.status === 406 || response.status === 415)) {
        ({response, rawText, hadAuthAttempt} = await run('application/json', 'application/json'));
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

    if (response.status === expectStatus || (expectStatus === 200 && response.ok)) {
      return {data, baseUrl};
    }

    failIfAuthenticatedUnauthorized(response, data, hadAuthAttempt, defaultError);

    const bullets = apiErrorBulletsFromBody(data, defaultError);
    const message = bullets[0] ?? defaultError;
    const statusSuffix = response.status ? ` (HTTP ${response.status})` : '';
    throw new OrderApiError(`${message}${statusSuffix}`, bullets);
  }

  throw (
    lastConnectionError ||
    new Error('Connection failed. Check that the server is running and reachable.')
  );
}

export function cartLinesToOrderRequest(
  lines: {product: {id: string}; quantity: number}[],
  deliveryAddress: string,
  notes?: string,
): CreateOrderRequest {
  return {
    lines: lines.map(l => ({
      product: productItemApiPath(l.product.id),
      quantity: l.quantity,
    })),
    deliveryAddress: deliveryAddress.trim(),
    notes: notes?.trim() || undefined,
  };
}

export async function createOrder(
  body: CreateOrderRequest,
  getToken: () => string | null,
): Promise<CreateOrderResult> {
  const {data, baseUrl} = await requestJson(
    '/api/orders',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    getToken,
    'Could not place order',
    201,
  );

  const order = normalizeUnknownToOrder(data);
  if (!order) {
    throw new Error('Could not parse order response');
  }
  return {order, baseUrl};
}

/**
 * Builds `/api/orders/{id}` for PATCH/cancel (handles JSON-LD `@id` values).
 */
export function orderItemApiPath(orderId: string): string {
  const t = orderId.trim();
  if (/^https?:\/\//i.test(t)) {
    const pathMatch = t.match(/^https?:\/\/[^/]+(\/api\/orders\/[^/?#]+)/i);
    if (pathMatch?.[1]) {
      return pathMatch[1];
    }
  }
  const withoutQuery = (t.split('?')[0] ?? t).trim();
  const match = withoutQuery.match(/(\/api\/orders\/[^/]+)\/?$/);
  if (match) {
    return match[1];
  }
  const slug = withoutQuery.replace(/^\/+/, '');
  return `/api/orders/${slug}`;
}

export async function cancelOrder(
  orderId: string,
  getToken: () => string | null,
): Promise<CreateOrderResult> {
  const path = orderItemApiPath(orderId);
  const {data, baseUrl} = await requestJson(
    path,
    {
      method: 'PATCH',
      body: JSON.stringify({status: 'cancelled'}),
    },
    getToken,
    'Could not cancel order',
    200,
    {contentType: 'application/merge-patch+json'},
  );

  const order = normalizeUnknownToOrder(data);
  if (!order) {
    throw new OrderApiError('Could not parse cancelled order response');
  }
  return {order, baseUrl};
}

export async function fetchMyOrders(
  getToken: () => string | null,
): Promise<FetchMyOrdersResult> {
  const {data, baseUrl} = await requestJson(
    '/api/orders',
    {method: 'GET'},
    getToken,
    'Could not load orders',
    200,
  );

  const items = extractCollectionItems(data);
  const orders: Order[] = [];
  for (const item of items) {
    const order = normalizeUnknownToOrder(item);
    if (order) {
      orders.push(order);
    }
  }

  orders.sort((a, b) => {
    const ta = Date.parse(a.createdAt) || 0;
    const tb = Date.parse(b.createdAt) || 0;
    return tb - ta;
  });

  return {orders, baseUrl};
}
