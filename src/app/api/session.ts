/**
 * Central handling for expired / invalid JWT responses.
 */

export class SessionExpiredError extends Error {
  constructor(
    message = 'Your session has expired. Please sign in again.',
  ) {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

let sessionExpiredHandler: (() => void) | null = null;

export function registerSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}

export function isSessionExpiredError(error: unknown): boolean {
  return error instanceof SessionExpiredError;
}

function stringish(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return undefined;
}

export function messageFromApiBody(data: unknown, fallback: string): string {
  const body =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;
  if (!body) {
    return fallback;
  }
  const hydra = body['hydra:description'] ?? body.hydraDescription;
  return (
    stringish(hydra) ||
    stringish(body.message) ||
    stringish(body.detail) ||
    stringish(body.error) ||
    fallback
  );
}

function looksLikeExpiredJwt(message: string): boolean {
  return /expired.*jwt|jwt.*expired|invalid.*token|token.*expired/i.test(message);
}

/**
 * When a request was sent with Authorization and the server returns 401,
 * clears the session and throws {@link SessionExpiredError}.
 */
export function failIfAuthenticatedUnauthorized(
  response: Response,
  data: unknown,
  hadAuthAttempt: boolean,
  fallbackMessage: string,
): void {
  if (response.status !== 401 || !hadAuthAttempt) {
    return;
  }
  notifySessionExpired();
  const raw = messageFromApiBody(data, fallbackMessage);
  throw new SessionExpiredError(
    looksLikeExpiredJwt(raw)
      ? 'Your session has expired. Please sign in again.'
      : 'Please sign in again to continue.',
  );
}
